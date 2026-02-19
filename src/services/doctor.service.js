import prisma from "../config/prismaclient.js";

//Get all active doctors
export const getAllDoctors = async () => {
  return await prisma.doctor.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
};

//Get single doctor by ID
export const getDoctorById = async (id) => {
  return await prisma.doctor.findUnique({
    where: { id },
  });
};

//Create new doctor (admin only)
export const createDoctor = async (data) => {
  return await prisma.doctor.create({ data });
};

//Update doctor (admin only)
export const updateDoctor = async (id, data) => {
  return await prisma.doctor.update({
    where: { id },
    data,
  });
};

//Delete doctor (admin only)
export const deleteDoctor = async (id) => {
  return await prisma.doctor.delete({ where: { id } });
};

//Toggle doctor active status
export const toggleDoctorStatus = async (id, isActive) => {
  return await prisma.doctor.update({
    where: { id },
    data: { isActive },
  });
};
