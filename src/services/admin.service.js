import prisma from "../config/prismaclient.js";

export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalDoctors,
    totalPredictions,
    highRiskCount,
    lowRiskCount,
    pendingAppointments,
    totalAppointments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.prediction.count(),
    prisma.prediction.count({ where: { riskLevel: "High Risk" } }),
    prisma.prediction.count({ where: { riskLevel: "Low Risk" } }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.count(),
  ]);

  // Predictions this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const predictionsThisWeek = await prisma.prediction.count({
    where: { createdAt: { gte: weekAgo } },
  });

  // Recent appointments
  const recentAppointments = await prisma.appointment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true, doctor: true },
  });

  return {
    totalUsers,
    totalDoctors,
    totalPredictions,
    highRiskCount,
    lowRiskCount,
    pendingAppointments,
    totalAppointments,
    predictionsThisWeek,
    recentAppointments,
  };
};

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { predictions: true, appointments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
