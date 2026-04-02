import app from "./src/app.js";
import dotenv from "dotenv";
import { startExpireAppointmentsJob } from "./src/jobs/expireAppointment.jobs.js";
import { startCyclePredictionJob } from "./src/jobs/cyclePrediction.js"; // ← no .jobs

dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startExpireAppointmentsJob();
  startCyclePredictionJob();
});
