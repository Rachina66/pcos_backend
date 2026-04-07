import prisma from "../../config/prismaclient.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// ═══ In-memory OTP store (key: email, value: { otp, expiresAt }) ═══
const otpStore = new Map();

// ═══ UPDATE NAME ═══
export const updateName = async (userId, name) => {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true, email: true, role: true },
  });
};

// ═══ CHANGE PASSWORD (requires current password) ═══
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return true;
};

// ═══ CHANGE EMAIL (requires password verification) ═══
export const changeEmail = async (userId, newEmail, password) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Password is incorrect");

  // Check if email already taken
  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) throw new Error("Email is already in use");

  return prisma.user.update({
    where: { id: userId },
    data: { email: newEmail },
    select: { id: true, name: true, email: true, role: true },
  });
};

// ═══ FORGOT PASSWORD – Generate OTP ═══
export const generateOtp = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("No account found with this email");

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store with 10-minute expiry
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
  });

  return otp;
};

// ═══ FORGOT PASSWORD – Verify OTP ═══
export const verifyOtp = (email, otp) => {
  const record = otpStore.get(email);

  if (!record) throw new Error("No OTP found. Please request a new one");
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    throw new Error("OTP has expired. Please request a new one");
  }
  if (record.otp !== otp) throw new Error("Invalid OTP");

  // Mark OTP as verified (keep it for the reset step)
  otpStore.set(email, { ...record, verified: true });

  return true;
};

// ═══ FORGOT PASSWORD – Reset Password (after OTP verified) ═══
export const resetPassword = async (email, newPassword) => {
  const record = otpStore.get(email);

  if (!record || !record.verified) {
    throw new Error("OTP not verified. Please verify OTP first");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Clean up OTP
  otpStore.delete(email);

  return true;
};
