import prisma from "../../config/prismaclient.js";

//LOG A PERIOD
export const logPeriod = async (userId, data) => {
  const { startDate, endDate, symptoms, notes } = data;

  if (!startDate) throw new Error("Start date is required");

  // Check for duplicate within 15 days of startDate
  const recentCycle = await prisma.cycleLog.findFirst({
    where: {
      userId,
      startDate: {
        gte: new Date(new Date(startDate).getTime() - 15 * 24 * 60 * 60 * 1000),
      },
    },
  });

  if (recentCycle) {
    throw new Error("A cycle was already logged recently. Update it instead.");
  }

  const periodLength = endDate
    ? Math.round(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24),
      ) + 1
    : null;

  return await prisma.cycleLog.create({
    data: {
      userId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      periodLength,
      symptoms: symptoms || [],
      notes: notes || null,
    },
  });
};

//GET CYCLE HISTORY
export const getCycleHistory = async (userId) => {
  return await prisma.cycleLog.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
};

//GET LATEST CYCLE
export const getLatestCycle = async (userId) => {
  return await prisma.cycleLog.findFirst({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
};

//UPDATE CYCLE LOG
export const updateCycleLog = async (id, userId, data) => {
  const cycle = await prisma.cycleLog.findFirst({
    where: { id, userId },
  });

  if (!cycle) throw new Error("Cycle log not found");

  const { startDate, endDate, symptoms, notes } = data;

  const start = startDate ? new Date(startDate) : cycle.startDate;
  const end = endDate ? new Date(endDate) : cycle.endDate;

  const periodLength =
    start && end
      ? Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
      : cycle.periodLength;

  return await prisma.cycleLog.update({
    where: { id },
    data: {
      startDate: start,
      endDate: end,
      periodLength,
      symptoms: symptoms || cycle.symptoms,
      notes: notes !== undefined ? notes : cycle.notes,
    },
  });
};

//DELETE CYCLE LOG
export const deleteCycleLog = async (id, userId) => {
  const cycle = await prisma.cycleLog.findFirst({
    where: { id, userId },
  });
  if (!cycle) throw new Error("Cycle log not found");
  return await prisma.cycleLog.delete({ where: { id } });
};

//PREDICT NEXT PERIOD
export const predictNextPeriod = async (userId) => {
  const cycles = await prisma.cycleLog.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    take: 4,
  });

  if (cycles.length === 0) {
    return {
      predicted: false,
      message:
        "No cycle data available. Log your first period to get predictions.",
    };
  }

  //Only 1 cycle — use default 28 days
  if (cycles.length === 1) {
    const nextDate = new Date(cycles[0].startDate);
    nextDate.setDate(nextDate.getDate() + 28);

    const daysUntil = Math.round(
      (nextDate - new Date()) / (1000 * 60 * 60 * 24),
    );

    const currentCycleDay =
      Math.round(
        (new Date() - new Date(cycles[0].startDate)) / (1000 * 60 * 60 * 24),
      ) + 1;

    return {
      predicted: true,
      nextPeriodDate: nextDate,
      avgCycleLength: 28,
      avgDuration: cycles[0].periodLength || null,
      regularity: "Unknown",
      daysUntil,
      basedOn: 1,
      lastPeriodDate: cycles[0].startDate,
      currentCycleDay,
      note: "Based on default 28-day cycle. Log more cycles for accuracy.",
    };
  }

  //Calculate gaps between cycle start dates
  const gaps = [];
  for (let i = 0; i < cycles.length - 1; i++) {
    const gap = Math.round(
      (new Date(cycles[i].startDate) - new Date(cycles[i + 1].startDate)) /
        (1000 * 60 * 60 * 24),
    );
    gaps.push(gap);
  }

  const avgCycleLength = Math.round(
    gaps.reduce((a, b) => a + b, 0) / gaps.length,
  );

  //Next period date
  const nextPeriodDate = new Date(cycles[0].startDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);

  const daysUntil = Math.round(
    (nextPeriodDate - new Date()) / (1000 * 60 * 60 * 24),
  );

  //Avg period duration
  const durations = cycles
    .filter((c) => c.periodLength)
    .map((c) => c.periodLength);

  const avgDuration =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

  //Regularity — variation in cycle lengths
  const maxGap = Math.max(...gaps);
  const minGap = Math.min(...gaps);
  const variation = maxGap - minGap;
  const regularity = variation <= 7 ? "Regular" : "Irregular";

  //Current cycle day
  const currentCycleDay =
    Math.round(
      (new Date() - new Date(cycles[0].startDate)) / (1000 * 60 * 60 * 24),
    ) + 1;

  return {
    predicted: true,
    nextPeriodDate,
    avgCycleLength,
    avgDuration,
    regularity,
    variation,
    daysUntil,
    basedOn: gaps.length,
    lastPeriodDate: cycles[0].startDate,
    currentCycleDay,
  };
};

//LOG TODAY'S SYMPTOMS
export const logSymptoms = async (userId, symptoms) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await prisma.symptomLog.findFirst({
    where: {
      userId,
      date: { gte: today, lt: tomorrow },
    },
  });

  if (existing) {
    return await prisma.symptomLog.update({
      where: { id: existing.id },
      data: { symptoms },
    });
  }

  return await prisma.symptomLog.create({
    data: { userId, symptoms },
  });
};

//GET TODAY'S SYMPTOMS
export const getTodaySymptoms = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await prisma.symptomLog.findFirst({
    where: {
      userId,
      date: { gte: today, lt: tomorrow },
    },
  });
};

//SYMPTOM INSIGHTS
export const getSymptomInsights = async (userId) => {
  const cycles = await prisma.cycleLog.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    take: 4,
  });

  if (cycles.length < 2) {
    return {
      hasInsights: false,
      message: "Log at least 2 cycles to see symptom insights",
    };
  }

  //Get all unique symptoms across all cycles
  const allSymptoms = [...new Set(cycles.flatMap((c) => c.symptoms))];

  if (allSymptoms.length === 0) {
    return {
      hasInsights: false,
      message: "No symptoms logged yet",
    };
  }

  const insights = allSymptoms.map((symptom) => {
    //Presence per cycle oldest → newest
    const presence = cycles
      .slice()
      .reverse()
      .map((c) => c.symptoms.includes(symptom));

    const totalOccurrences = presence.filter(Boolean).length;
    const frequency = Math.round((totalOccurrences / cycles.length) * 100);

    //Trend — compare older half vs newer half
    const mid = Math.floor(presence.length / 2);
    const olderHalf = presence.slice(0, mid).filter(Boolean).length;
    const newerHalf = presence.slice(mid).filter(Boolean).length;

    let trend;
    if (newerHalf < olderHalf) trend = "improving";
    else if (newerHalf > olderHalf) trend = "worsening";
    else trend = "consistent";

    return {
      symptom,
      trend,
      frequency,
      totalOccurrences,
      cyclesTracked: cycles.length,
      presence,
    };
  });

  //Sort by frequency descending
  insights.sort((a, b) => b.frequency - a.frequency);

  return {
    hasInsights: true,
    cyclesAnalyzed: cycles.length,
    improving: insights.filter((i) => i.trend === "improving"),
    worsening: insights.filter((i) => i.trend === "worsening"),
    consistent: insights.filter((i) => i.trend === "consistent"),
    mostCommon: insights.slice(0, 3).map((i) => i.symptom),
    all: insights,
  };
};

//FOR CRON JOB
export const getUsersWithUpcomingPeriod = async () => {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const results = [];

  for (const user of users) {
    const prediction = await predictNextPeriod(user.id);

    if (!prediction.predicted) continue;
    if (prediction.daysUntil !== 3) continue;

    results.push({
      userId: user.id,
      email: user.email,
      name: user.name,
      nextPeriodDate: prediction.nextPeriodDate,
    });
  }

  return results;
};
