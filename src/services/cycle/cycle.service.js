import prisma from "../../config/prismaclient.js";

const GRACE_GAP = 2;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toUTCMidnight = (date) => {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
};

const daysBetween = (a, b) => {
  return Math.round((toUTCMidnight(b) - toUTCMidnight(a)) / MS_PER_DAY);
};

// ─── DAILY LOG ───────────────────────────────────────────────────────────────

export const upsertDailyLog = async (userId, data) => {
  const { date, isPeriod, flow, mood, energy, symptoms, notes } = data;
  if (!date) throw new Error("Date is required");

  const day = toUTCMidnight(date);

  const log = await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: day } },
    update: {
      isPeriod: isPeriod ?? false,
      flow: flow ?? null,
      mood: mood ?? null,
      energy: energy ?? null,
      symptoms: symptoms || [],
      notes: notes ?? null,
    },
    create: {
      userId,
      date: day,
      isPeriod: isPeriod ?? false,
      flow: flow ?? null,
      mood: mood ?? null,
      energy: energy ?? null,
      symptoms: symptoms || [],
      notes: notes ?? null,
    },
  });

  await rebuildCycles(userId, day);
  return log;
};

export const getDailyLog = async (userId, date) => {
  const day = toUTCMidnight(date);
  return await prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date: day } },
  });
};

export const getDailyLogsInRange = async (userId, from, to) => {
  if (!from || !to) throw new Error("from and to dates are required");
  return await prisma.dailyLog.findMany({
    where: {
      userId,
      date: { gte: toUTCMidnight(from), lte: toUTCMidnight(to) },
    },
    orderBy: { date: "asc" },
  });
};

// ─── CYCLE DETECTION ─────────────────────────────────────────────────────────

const rebuildCycles = async (userId, changedDate) => {
  const base = toUTCMidnight(changedDate);

  const from = new Date(base);
  from.setUTCDate(from.getUTCDate() - 10);

  const to = new Date(base);
  to.setUTCDate(to.getUTCDate() + 10);

  const periodLogs = await prisma.dailyLog.findMany({
    where: { userId, isPeriod: true, date: { gte: from, lte: to } },
    orderBy: { date: "asc" },
  });

  const cycles = groupIntoCycles(periodLogs);

  await prisma.cycleLog.deleteMany({
    where: {
      userId,
      OR: [
        { startDate: { gte: from, lte: to } },
        { endDate: { gte: from, lte: to } },
        { startDate: { lte: from }, endDate: { gte: to } },
      ],
    },
  });

  if (cycles.length === 0) return;

  await prisma.cycleLog.createMany({
    data: cycles.map((c) => ({
      userId,
      startDate: toUTCMidnight(c.startDate),
      endDate: toUTCMidnight(c.endDate),
      periodLength: c.periodLength,
    })),
  });
};

const groupIntoCycles = (logs) => {
  if (logs.length === 0) return [];

  const cycles = [];
  let current = [logs[0]];

  for (let i = 1; i < logs.length; i++) {
    const gap = daysBetween(logs[i - 1].date, logs[i].date);
    if (gap <= GRACE_GAP) {
      current.push(logs[i]);
    } else {
      cycles.push(buildCycle(current));
      current = [logs[i]];
    }
  }

  cycles.push(buildCycle(current));
  return cycles;
};

const buildCycle = (logs) => {
  const startDate = toUTCMidnight(logs[0].date);
  const endDate = toUTCMidnight(logs[logs.length - 1].date);
  const periodLength = daysBetween(startDate, endDate) + 1;
  return { startDate, endDate, periodLength };
};

// ─── CYCLE HISTORY ────────────────────────────────────────────────────────────

export const getCycleHistory = async (userId) => {
  return await prisma.cycleLog.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
};

// ─── PREDICTION ───────────────────────────────────────────────────────────────

export const predictNextPeriod = async (userId) => {
  const cycles = await prisma.cycleLog.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    take: 4,
  });

  if (cycles.length === 0) {
    return {
      predicted: false,
      message: "No cycle data yet. Log your first period to get predictions.",
    };
  }

  const today = toUTCMidnight(new Date());
  const currentCycleDay = daysBetween(cycles[0].startDate, today) + 1;

  if (cycles.length === 1) {
    const nextPeriodStart = new Date(toUTCMidnight(cycles[0].startDate));
    nextPeriodStart.setUTCDate(nextPeriodStart.getUTCDate() + 28);

    const nextPeriodEnd = new Date(nextPeriodStart);
    nextPeriodEnd.setUTCDate(
      nextPeriodEnd.getUTCDate() + (cycles[0].periodLength - 1),
    );

    const daysUntil = daysBetween(today, nextPeriodStart);
    const status = getStatus(daysUntil);

    return {
      predicted: true,
      nextPeriodStart,
      nextPeriodEnd,
      avgCycleLength: 28,
      avgPeriodLength: cycles[0].periodLength,
      regularity: "unknown",
      confidence: "low",
      daysUntil,
      status,
      basedOn: 1,
      currentCycleDay,
      lastPeriodDate: cycles[0].startDate,
      note: "Based on default 28-day cycle. Log more periods for accuracy.",
    };
  }

  const gaps = [];
  for (let i = 0; i < cycles.length - 1; i++) {
    gaps.push(daysBetween(cycles[i + 1].startDate, cycles[i].startDate));
  }

  const avgCycleLength = Math.round(
    gaps.reduce((a, b) => a + b, 0) / gaps.length,
  );
  const avgPeriodLength = Math.round(
    cycles.reduce((a, c) => a + c.periodLength, 0) / cycles.length,
  );

  const nextPeriodStart = new Date(toUTCMidnight(cycles[0].startDate));
  nextPeriodStart.setUTCDate(nextPeriodStart.getUTCDate() + avgCycleLength);

  const nextPeriodEnd = new Date(nextPeriodStart);
  nextPeriodEnd.setUTCDate(nextPeriodEnd.getUTCDate() + (avgPeriodLength - 1));

  const daysUntil = daysBetween(today, nextPeriodStart);
  const variation = Math.max(...gaps) - Math.min(...gaps);
  const regularity = variation <= 7 ? "regular" : "irregular";
  const confidence =
    cycles.length >= 4 ? "high" : cycles.length === 3 ? "medium" : "low";
  const status = getStatus(daysUntil);

  return {
    predicted: true,
    nextPeriodStart,
    nextPeriodEnd,
    avgCycleLength,
    avgPeriodLength,
    regularity,
    variation,
    confidence,
    daysUntil,
    status,
    basedOn: gaps.length,
    currentCycleDay,
    lastPeriodDate: cycles[0].startDate,
  };
};

const getStatus = (daysUntil) => {
  if (daysUntil > 3) return "upcoming";
  if (daysUntil >= -7) return "due";
  return "late";
};

// ─── INSIGHTS ─────────────────────────────────────────────────────────────────

export const getInsights = async (userId) => {
  const cycles = await prisma.cycleLog.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    take: 4,
  });

  if (cycles.length < 2) {
    return {
      hasInsights: false,
      message: "Log at least 2 cycles to see insights.",
    };
  }

  const oldest = toUTCMidnight(cycles[cycles.length - 1].startDate);
  const newest = toUTCMidnight(cycles[0].endDate);

  const allLogs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: oldest, lte: newest } },
    orderBy: { date: "asc" },
  });

  const periodLogs = allLogs.filter((l) => l.isPeriod);
  const nonPeriodLogs = allLogs.filter((l) => !l.isPeriod);

  const symptomCounts = {};
  allLogs.forEach((log) => {
    log.symptoms.forEach((s) => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
  });

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symptom, count]) => ({
      symptom,
      count,
      frequency: Math.round((count / allLogs.length) * 100),
    }));

  const moodMap = { HAPPY: 5, NEUTRAL: 3, SAD: 2, IRRITABLE: 1, TIRED: 2 };

  const avgMood = (logs) => {
    const scored = logs.filter((l) => l.mood).map((l) => moodMap[l.mood]);
    return scored.length
      ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
      : null;
  };

  const avgEnergy = (logs) => {
    const scored = logs.filter((l) => l.energy).map((l) => l.energy);
    return scored.length
      ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
      : null;
  };

  return {
    hasInsights: true,
    cyclesAnalyzed: cycles.length,
    topSymptoms,
    mood: {
      duringPeriod: avgMood(periodLogs),
      outsidePeriod: avgMood(nonPeriodLogs),
    },
    energy: {
      duringPeriod: avgEnergy(periodLogs),
      outsidePeriod: avgEnergy(nonPeriodLogs),
    },
  };
};

// ─── CRON HELPER ──────────────────────────────────────────────────────────────

export const getUsersWithUpcomingPeriod = async () => {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: { id: true, name: true, email: true },
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
      nextPeriodStart: prediction.nextPeriodStart,
    });
  }
  return results;
};
