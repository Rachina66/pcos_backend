import prisma from "../../config/prismaclient.js";

// ═══ DOCTORS (Everyone sees same) ═══
export const getAllDoctors = async () => {
  return await prisma.doctor.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getDoctorById = async (id) => {
  return await prisma.doctor.findUnique({
    where: { id },
  });
};

export const getAvailableSlots = async (doctorId, date) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) return null;

  // Get booked appointments for this date
  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: new Date(date),
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    select: { timeSlot: true },
  });

  const bookedSlots = bookedAppointments.map((apt) => apt.timeSlot);
  const availableSlots = doctor.timeSlots.filter(
    (slot) => !bookedSlots.includes(slot),
  );

  return {
    doctor: {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
    },
    date,
    allSlots: doctor.timeSlots,
    bookedSlots,
    availableSlots,
  };
};

// ═══ EDUCATIONAL CONTENT (Everyone sees same) ═══
export const getAllContent = async () => {
  return await prisma.educationalContent.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getContentById = async (id) => {
  return await prisma.educationalContent.findUnique({
    where: { id },
  });
};

export const getContentByCategory = async (category) => {
  return await prisma.educationalContent.findMany({
    where: {
      category,
      isPublished: true,
    },
    orderBy: { createdAt: "desc" },
  });
};
