import prisma from "../../config/prismaclient.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
const otpStore = new Map();

//Update Name
export const updateName = async (userId, name) => {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true, email: true, role: true },
  });
};

//Change Password
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return true;
};

//Generate OTP for forgot password
export const generateOtp = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("No account found with this email");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
  return otp;
};

//Verify OTP and Reset Password
export const resetPasswordWithOtp = async (email, otp, newPassword) => {
  const record = otpStore.get(email);
  if (!record) throw new Error("No OTP found. Request a new one");
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    throw new Error("OTP expired. Request a new one");
  }
  if (record.otp !== otp) throw new Error("Invalid OTP");

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { email }, data: { password: hashed } });
  otpStore.delete(email);
  return true;
};