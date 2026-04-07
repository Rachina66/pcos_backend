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

// ═══ SEND OTP EMAIL ═══
export const sendOtpEmail = async (userEmail, otp) => {
  try {
    await transporter.sendMail({
      from: `"PCOS Health App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #B565A7;">Password Reset Request</h2>
          <p>You requested a password reset. Use the OTP below to verify your identity:</p>
          <div style="background: #f9f0f7; padding: 24px; border-radius: 8px; margin: 16px 0; text-align: center;">
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #B565A7; margin: 0;">${otp}</p>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p style="color: #888;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
          <p style="color: #B565A7;">PCOS Health App</p>
        </div>
      `,
    });
    console.log("OTP email sent to", userEmail);
  } catch (error) {
    console.error("Failed to send OTP email:", error.message);
    throw new Error("Failed to send OTP email");
  }
};

// ═══ SEND PASSWORD CHANGED CONFIRMATION ═══
export const sendPasswordChangedEmail = async (userEmail, userName) => {
  try {
    await transporter.sendMail({
      from: `"PCOS Health App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Password Changed Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #B565A7;">Password Changed</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Your password has been changed successfully.</p>
          <p style="color: #888;">If you did not make this change, please contact support immediately.</p>
          <p style="color: #B565A7;">PCOS Health App</p>
        </div>
      `,
    });
    console.log("Password changed email sent to", userEmail);
  } catch (error) {
    console.error("Failed to send password changed email:", error.message);
  }
};
