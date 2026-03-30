import prisma from "../../config/prismaclient.js";

// ═══ PREDICTIONS ═══
export const createPrediction = async (data) => {
  return await prisma.prediction.create({ data });
};

export const getUserPredictions = async (userId) => {
  return await prisma.prediction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getPredictionById = async (id) => {
  return await prisma.prediction.findUnique({
    where: { id },
  });
};

// ═══ APPOINTMENTS ═══
export const createAppointment = async (data) => {
  return await prisma.appointment.create({
    data,
    include: { doctor: true },
  });
};

export const getUserAppointments = async (userId) => {
  return await prisma.appointment.findMany({
    where: { userId },
    include: { doctor: true },
    orderBy: { date: "asc" },
  });
};

export const getUserAppointmentById = async (id, userId) => {
  return await prisma.appointment.findFirst({
    where: { id, userId },
    include: { doctor: true },
  });
};

// Check if slot is already taken
export const isSlotTaken = async (doctorId, date, timeSlot) => {
  const existing = await prisma.appointment.findFirst({
    where: {
      doctorId,
      date: new Date(date),
      timeSlot,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });
  return !!existing;
};

// Cancel appointment
export const cancelAppointment = async (id) => {
  return await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { doctor: true },
  });
};
