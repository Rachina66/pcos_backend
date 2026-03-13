import prisma from "../../config/prismaclient.js";

// ═══ DASHBOARD STATS ═══
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

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const predictionsThisWeek = await prisma.prediction.count({
    where: { createdAt: { gte: weekAgo } },
  });

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

// ═══ USER MANAGEMENT ═══
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

// ═══ DOCTOR MANAGEMENT ═══
export const getAllDoctorsAdmin = async () => {
  return await prisma.doctor.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getDoctorById = async (id) => {
  return await prisma.doctor.findUnique({ where: { id } });
};

export const createDoctor = async (data) => {
  return await prisma.doctor.create({ data });
};

export const updateDoctor = async (id, data) => {
  return await prisma.doctor.update({ where: { id }, data });
};

export const deleteDoctor = async (id) => {
  return await prisma.doctor.delete({ where: { id } });
};

// ═══ CONTENT MANAGEMENT ═══
export const getAllContentAdmin = async () => {
  return await prisma.educationalContent.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getContentById = async (id) => {
  return await prisma.educationalContent.findUnique({ where: { id } });
};

export const createContent = async (data) => {
  return await prisma.educationalContent.create({ data });
};

export const updateContent = async (id, data) => {
  return await prisma.educationalContent.update({ where: { id }, data });
};

export const deleteContent = async (id) => {
  return await prisma.educationalContent.delete({ where: { id } });
};

// ═══ APPOINTMENT MONITORING ═══
export const getAllAppointments = async () => {
  return await prisma.appointment.findMany({
    include: { doctor: true, user: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getAppointmentById = async (id) => {
  return await prisma.appointment.findUnique({
    where: { id },
    include: { doctor: true, user: true },
  });
};
