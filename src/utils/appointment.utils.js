// Check if booking slot has already passed today
export const isSlotInPast = (date, timeSlot) => {
  const appointmentDate = new Date(date);
  const today = new Date();

  // If appointment is on a future date it is fine
  if (appointmentDate.toDateString() !== today.toDateString()) {
    return false;
  }

  // Parse time slot e.g. "09:00 AM"
  const [time, period] = timeSlot.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);

  return today > slotTime;
};

// Check if cancellation is too late
export const isCancellationTooLate = (
  appointmentDate,
  timeSlot,
  hoursBeforeDeadline = 2,
) => {
  const appointmentDateTime = new Date(appointmentDate);

  const [time, period] = timeSlot.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  appointmentDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const diffInHours = (appointmentDateTime - now) / (1000 * 60 * 60);

  return diffInHours < hoursBeforeDeadline;
};
