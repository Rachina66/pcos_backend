import express from "express";
import prisma from "../config/prismaclient.js";
import { spawn } from "child_process";
import path from "path";

const router = express.Router();


// Helper: Input Validation

function validateInput(data) {
  const errors = [];

  if (!data.age || data.age <= 0 || data.age > 100)
    errors.push("Age must be between 1 and 100");

  if (!data.weight || data.weight <= 0 || data.weight > 300)
    errors.push("Weight must be between 1 and 300 kg");

  if (!data.height || data.height <= 0 || data.height > 250)
    errors.push("Height must be between 1 and 250 cm");

  if (!data.bmi || data.bmi <= 0 || data.bmi > 70)
    errors.push("BMI must be between 1 and 70");

  if (
    !data.cycleLengthDays ||
    data.cycleLengthDays < 15 ||
    data.cycleLengthDays > 90
  )
    errors.push("Cycle length must be between 15 and 90 days");

  if (
    !data.periodLengthDays ||
    data.periodLengthDays < 1 ||
    data.periodLengthDays > 15
  )
    errors.push("Period length must be between 1 and 15 days");

  if (!data.fshLevel || data.fshLevel < 0 || data.fshLevel > 200)
    errors.push("FSH level must be between 0 and 200");

  if (!data.lhLevel || data.lhLevel < 0 || data.lhLevel > 200)
    errors.push("LH level must be between 0 and 200");

  if (!data.androgenLevel || data.androgenLevel < 0 || data.androgenLevel > 500)
    errors.push("Androgen level must be between 0 and 500");

  if (data.cystCount === undefined || data.cystCount < 0 || data.cystCount > 50)
    errors.push("Cyst count must be between 0 and 50");

  if (
    !data.fastingGlucose ||
    data.fastingGlucose < 50 ||
    data.fastingGlucose > 400
  )
    errors.push("Fasting glucose must be between 50 and 400");

  if (!data.activityLevel || data.activityLevel < 1 || data.activityLevel > 5)
    errors.push("Activity level must be between 1 and 5");

  if (!data.stressLevel || data.stressLevel < 1 || data.stressLevel > 5)
    errors.push("Stress level must be between 1 and 5");

  return errors;
}


// Run Python Prediction

function runPythonPrediction(inputData, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "predict.py");
    const python = spawn("python", [scriptPath]);

    let dataString = "";
    let errorString = "";

    const timer = setTimeout(() => {
      python.kill();
      reject(new Error("Python script timed out"));
    }, timeout);

    python.stdin.write(JSON.stringify(inputData));
    python.stdin.end();

    python.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorString += data.toString();
    });

    python.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`Python script failed: ${errorString}`));
      } else {
        try {
          const result = JSON.parse(dataString);
          resolve(result);
        } catch (e) {
          reject(new Error("Failed to parse Python output"));
        }
      }
    });
  });
}


// POST /api/predict

router.post("/predict", async (req, res) => {
  try {
    const { userId, data } = req.body;

    if (!userId || !data) {
      return res.status(400).json({
        success: false,
        error: "userId and data are required",
      });
    }

    const errors = validateInput(data);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }

    const pythonInput = {
      Age_yrs: Number(data.age),
      Weight_kg: Number(data.weight),
      Height_cm: Number(data.height),
      BMI: Number(data.bmi),
      Cycle_Length_Days: Number(data.cycleLengthDays),
      Period_Length_Days: Number(data.periodLengthDays),
      "Regular_Ovulation_Y/N": data.regularOvulation ? 1 : 0,
      "FSH_mIU/mL": Number(data.fshLevel),
      "LH_mIU/mL": Number(data.lhLevel),
      Androgen_Level: Number(data.androgenLevel),
      Cyst_Count: Number(data.cystCount),
      "Hirsutism_Y/N": data.hirsutism ? 1 : 0,
      "Fasting_Glucose_mg/dL": Number(data.fastingGlucose),
      Activity_Level_1_5: Number(data.activityLevel),
      Stress_Level_1_5: Number(data.stressLevel),
      "Pregnant_Y/N": data.pregnant ? 1 : 0,
    };

    const result = await runPythonPrediction(pythonInput, 10000);

    if (!result.success) {
      return res.status(500).json(result);
    }
    const prediction = await prisma.prediction.create({
      data: {
        userId: String(userId), 
        age: Number(data.age),
        weight: Number(data.weight),
        height: Number(data.height),
        bmi: Number(data.bmi),
        bloodGroup: data.bloodGroup,
        cycleLengthDays: Number(data.cycleLengthDays),
        periodLengthDays: Number(data.periodLengthDays),
        regularOvulation: Boolean(data.regularOvulation),
        fshLevel: Number(data.fshLevel),
        lhLevel: Number(data.lhLevel),
        androgenLevel: Number(data.androgenLevel),
        cystCount: Number(data.cystCount),
        hirsutism: Boolean(data.hirsutism),
        fastingGlucose: Number(data.fastingGlucose),
        activityLevel: Number(data.activityLevel),
        stressLevel: Number(data.stressLevel),
        pregnant: Boolean(data.pregnant),
        prediction: result.prediction,
        probability: result.probability,
        riskLevel: result.risk_level,
        confidence: result.confidence,
      },
    });

    res.json({
      success: true,
      predictionId: prediction.id,
      result: {
        prediction: result.prediction,
        riskLevel: result.risk_level,
        confidence: result.confidence,
        probability: result.probability,
      },
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({
      success: false,
      error: "Prediction failed",
    });
  }
});


// GET /api/predictions/:userId

router.get("/predictions/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        // ✅ FIXED - added this line back
        success: false,
        error: "Invalid userId",
      });
    }

    const predictions = await prisma.prediction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    res.json({
      success: true,
      predictions,
    });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch predictions",
    });
  }
});

export default router;
