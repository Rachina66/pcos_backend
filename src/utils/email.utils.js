import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ═══ BOOKING CONFIRMATION TO USER ═══
export const sendBookingConfirmation = async (userEmail, userName, details) => {
  try {
    await transporter.sendMail({
      from: `"PCOS Health App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Appointment Booked Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #B565A7;">Appointment Booked</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your appointment has been booked successfully and is awaiting doctor confirmation.</p>
          <div style="background: #f9f0f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Doctor:</strong> ${details.doctorName}</p>
            <p><strong>Date:</strong> ${details.date}</p>
            <p><strong>Time:</strong> ${details.timeSlot}</p>
            <p><strong>Hospital:</strong> ${details.hospital}</p>
            <p><strong>Status:</strong> Pending Confirmation</p>
          </div>
          <p>You will receive another email once the doctor confirms your appointment.</p>
          <p style="color: #B565A7;">PCOS Health App</p>
        </div>
      `,
    });
    console.log("Booking confirmation email sent to", userEmail);
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error.message);
  }
};

// ═══ APPOINTMENT CONFIRMED TO USER ═══
export const sendAppointmentConfirmed = async (
  userEmail,
  userName,
  details,
) => {
  try {
    await transporter.sendMail({
      from: `"PCOS Health App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Your Appointment is Confirmed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #B565A7;">Appointment Confirmed</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your appointment has been <strong style="color: green;">confirmed</strong> by the doctor.</p>
          <div style="background: #f9f0f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Doctor:</strong> ${details.doctorName}</p>
            <p><strong>Date:</strong> ${details.date}</p>
            <p><strong>Time:</strong> ${details.timeSlot}</p>
            <p><strong>Hospital:</strong> ${details.hospital}</p>
          </div>
          <p>Please arrive 10 minutes before your appointment time.</p>
          <p style="color: #B565A7;">PCOS Health App</p>
        </div>
      `,
    });
    console.log("Confirmation email sent to", userEmail);
  } catch (error) {
    console.error("Failed to send confirmation email:", error.message);
  }
};

// ═══ APPOINTMENT CANCELLED BY DOCTOR TO USER ═══
export const sendAppointmentRejected = async (
  userEmail,
  userName,
  details,
  reason,
) => {
  try {
    await transporter.sendMail({
      from: `"PCOS Health App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Appointment Cancelled by Doctor",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #B565A7;">Appointment Cancelled</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Unfortunately your appointment has been <strong style="color: red;">cancelled</strong> by the doctor.</p>
          <div style="background: #f9f0f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Doctor:</strong> ${details.doctorName}</p>
            <p><strong>Date:</strong> ${details.date}</p>
            <p><strong>Time:</strong> ${details.timeSlot}</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
          </div>
          <p>You can book another appointment at your convenience.</p>
          <p style="color: #B565A7;">PCOS Health App</p>
        </div>
      `,
    });
    console.log("Rejection email sent to", userEmail);
  } catch (error) {
    console.error("Failed to send rejection email:", error.message);
  }
};

// ═══ APPOINTMENT CANCELLED BY USER TO DOCTOR ═══
export const sendCancellationToDoctor = async (
  doctorEmail,
  doctorName,
  details,
) => {
  try {
    await transporter.sendMail({
      from: `"PCOS Health App" <${process.env.EMAIL_USER}>`,
      to: doctorEmail,
      subject: "Appointment Cancelled by Patient",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #B565A7;">Appointment Cancelled</h2>
          <p>Hello <strong>Dr. ${doctorName}</strong>,</p>
          <p>A patient has cancelled their appointment. The slot is now available.</p>
          <div style="background: #f9f0f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Patient:</strong> ${details.patientName}</p>
            <p><strong>Date:</strong> ${details.date}</p>
            <p><strong>Time:</strong> ${details.timeSlot}</p>
          </div>
          <p style="color: #B565A7;">PCOS Health App</p>
        </div>
      `,
    });
    console.log("Cancellation email sent to doctor", doctorEmail);
  } catch (error) {
    console.error(
      "Failed to send cancellation email to doctor:",
      error.message,
    );
  }
};

// ═══ APPOINTMENT COMPLETED TO USER ═══
export const sendAppointmentCompleted = async (
  userEmail,
  userName,
  details,
) => {
  try {
    await transporter.sendMail({
      from: `"PCOS Health App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Appointment Completed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #B565A7;">Appointment Completed</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your appointment has been marked as <strong style="color: blue;">completed</strong>.</p>
          <div style="background: #f9f0f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Doctor:</strong> ${details.doctorName}</p>
            <p><strong>Date:</strong> ${details.date}</p>
            <p><strong>Time:</strong> ${details.timeSlot}</p>
          </div>
          <p>Please open the app to view your consultation notes and prescription.</p>
          <p style="color: #B565A7;">PCOS Health App</p>
        </div>
      `,
    });
    console.log("Completion email sent to", userEmail);
  } catch (error) {
    console.error("Failed to send completion email:", error.message);
  }
};
