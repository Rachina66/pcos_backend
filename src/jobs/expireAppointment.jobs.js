import cron from "node-cron";
import prisma from "../config/prismaclient.js";

export const startExpireAppointmentsJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();

      const result = await prisma.appointment.updateMany({
        where: {
          status: "PENDING",
          date: { lt: now },
        },
        data: { status: "CANCELLED" },
      });

      console.log(`Auto-expired ${result.count} past PENDING appointments`);
    } catch (error) {
      console.error("Failed to expire appointments:", error.message);
    }
  });

  console.log("Appointment expiry job scheduled");
};
