import prisma from "../config/prismaclient.js";

export const createAppointment = async (data) => {
  return await prisma.appointment.create({
    data,
    include: { doctor: true, user: true },
  });
};

export const getUserAppointments = async (userId) => {
  return await prisma.appointment.findMany({
    where: { userId },
    include: { doctor: true },
    orderBy: { createdAt: "desc" },
  });
};

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

//notes part
export const updateAppointmentStatus = async (id, status, notes) => {
  return await prisma.appointment.update({
    where: { id },
    data: { status, notes },
  });
};
