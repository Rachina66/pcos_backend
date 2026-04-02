import cron from "node-cron";
import { getUsersWithUpcomingPeriod } from "../services/cycle/cycle.service.js";
import { sendPeriodReminder } from "../utils/periodEmail.utils.js"; // ← correct filename

export const startCyclePredictionJob = () => {
  cron.schedule("0 8 * * *", async () => {
    try {
      console.log("Running cycle prediction job...");
      const users = await getUsersWithUpcomingPeriod();
      for (const user of users) {
        await sendPeriodReminder(user.email, user.name, user.nextPeriodDate);
      }
      console.log(`Period reminders sent to ${users.length} users`);
    } catch (error) {
      console.error("Cycle prediction job failed:", error.message);
    }
  });
  console.log("Cycle prediction job scheduled");
};
