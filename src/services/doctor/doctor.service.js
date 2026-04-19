import prisma from "../../config/prismaclient.js";

// ═══ PROFILE MANAGEMENT ═══
export const getDoctorProfileByEmail = async (email) => {
  return await prisma.doctor.findUnique({
    where: { email },
  });
};

export const updateDoctorProfile = async (email, data) => {
  return await prisma.doctor.update({
    where: { email },
    data,
  });
};

// ═══ DASHBOARD STATS ═══
export const getDoctorStats = async (doctorId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const [
    totalAppointments,
    todayCount,
    upcomingCount,
    pendingCount,
    completedThisMonth,
    totalPatients,
    completedAppointments,
  ] = await Promise.all([
    prisma.appointment.count({ where: { doctorId } }),

    prisma.appointment.count({
      where: {
        doctorId,
        date: { gte: today, lt: tomorrow },
      },
    }),

    prisma.appointment.count({
      where: {
        doctorId,
        date: { gte: today },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),

    prisma.appointment.count({
      where: { doctorId, status: "PENDING" },
    }),

    prisma.appointment.count({
      where: {
        doctorId,
        status: "COMPLETED",
        createdAt: { gte: thisMonth },
      },
    }),

    prisma.appointment.findMany({
      where: { doctorId },
      distinct: ["userId"],
      select: { userId: true },
    }),

    prisma.appointment.findMany({
      where: { doctorId, status: "COMPLETED" },
      include: { doctor: { select: { consultFee: true } } },
    }),
  ]);

  const totalEarnings = completedAppointments.reduce(
    (sum, apt) => sum + apt.doctor.consultFee,
    0,
  );

  return {
    totalAppointments,
    todayAppointments: todayCount,
    upcomingAppointments: upcomingCount,
    pendingAppointments: pendingCount,
    completedThisMonth,
    totalPatients: totalPatients.length,
    totalEarnings,
  };
};

// ═══ APPOINTMENT MANAGEMENT ═══
export const getDoctorAppointments = async (doctorId, filters = {}) => {
  const where = { doctorId };

  // Filter by status
  if (filters.status) {
    where.status = filters.status;
  }

  // Filter by specific date
  if (filters.date) {
    const date = new Date(filters.date);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    where.date = { gte: date, lt: nextDay };
  }

  return await prisma.appointment.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      prediction: true,
    },
    orderBy: { date: "asc" },
  });
};

export const getTodayAppointments = async (doctorId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await prisma.appointment.findMany({
    where: {
      doctorId,
      date: { gte: today, lt: tomorrow },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      prediction: true,
    },
    orderBy: { timeSlot: "asc" },
  });
};

export const getUpcomingAppointments = async (doctorId) => {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  return await prisma.appointment.findMany({
    where: {
      doctorId,
      date: { gte: today, lte: nextWeek },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      prediction: true,
    },
    orderBy: { date: "asc" },
  });
};

export const getPastAppointments = async (doctorId) => {
  const today = new Date();

  return await prisma.appointment.findMany({
    where: {
      doctorId,
      date: { lt: today },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      prediction: true,
    },
    orderBy: { date: "desc" },
  });
};

export const getAppointmentById = async (id) => {
  return await prisma.appointment.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      prediction: true,
    },
  });
};
export const updateAppointmentStatus = async (id, status, notes) => {
  return await prisma.appointment.update({
    where: { id },
    data: { status, notes: notes || null },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      prediction: true,
    },
  });
};

export const addConsultationNotes = async (id, data) => {
  return await prisma.appointment.update({
    where: { id },
    data: {
      consultationNotes: data.consultationNotes || null,
      prescription: data.prescription || null,
      diagnosis: data.diagnosis || null,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      prediction: true,
    },
  });
};

export const bulkConfirmAppointments = async (doctorId, appointmentIds) => {
  return await prisma.appointment.updateMany({
    where: {
      id: { in: appointmentIds },
      doctorId,
      status: "PENDING",
    },
    data: { status: "CONFIRMED" },
  });
};

// ═══ PATIENT MANAGEMENT ═══
export const getDoctorPatients = async (doctorId) => {
  const appointments = await prisma.appointment.findMany({
    where: { doctorId },
    distinct: ["userId"],
    include: {
      user: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
      prediction: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Get appointment count for each patient
  const patients = await Promise.all(
    appointments.map(async (apt) => {
      const appointmentCount = await prisma.appointment.count({
        where: { doctorId, userId: apt.userId },
      });

      const lastAppointment = await prisma.appointment.findFirst({
        where: { doctorId, userId: apt.userId },
        orderBy: { date: "desc" },
      });

      return {
        ...apt.user,
        totalAppointments: appointmentCount,
        lastVisit: lastAppointment?.date || null,
      };
    }),
  );

  return patients;
};

export const getPatientById = async (doctorId, userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) return null;

  const appointmentCount = await prisma.appointment.count({
    where: { doctorId, userId },
  });

  const lastAppointment = await prisma.appointment.findFirst({
    where: { doctorId, userId },
    orderBy: { date: "desc" },
  });

  return {
    ...user,
    totalAppointments: appointmentCount,
    lastVisit: lastAppointment?.date || null,
  };
};

export const getPatientAppointments = async (doctorId, userId) => {
  return await prisma.appointment.findMany({
    where: { doctorId, userId },
    include: { prediction: true },
    orderBy: { date: "desc" },
  });
};

export const getPatientPredictions = async (userId) => {
  return await prisma.prediction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};
