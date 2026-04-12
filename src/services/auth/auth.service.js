import prisma from "../../config/prismaclient.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt.utils.js";

const SALT_ROUNDS = 10;
const otpStore = new Map(); // for email verification OTPs

//Register
export const register = async ({ name, email, password, role }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  //Create user as unverified
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "USER",
      isVerified: false,
    },
  });

  //Generate OTP for email verification
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

  return { email, otp }; // otp returned so controller can email it
};

// VERIFY EMAIL
export const verifyEmail = async (email, otp) => {
  const record = otpStore.get(email);
  if (!record) throw new Error("No OTP found. Please register again");
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    throw new Error("OTP expired. Please register again");
  }
  if (record.otp !== otp) throw new Error("Invalid OTP");

  await prisma.user.update({
    where: { email },
    data: { isVerified: true },
  });

  otpStore.delete(email);
  return true;
};

//Login
export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  //Block unverified users
  if (!user.isVerified) throw new Error("Please verify your email first"); // ← new

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

//GET USER BY ID
export const getUserById = async (id) => {
  return prisma.user.findUnique({ where: { id } });
};

//Register Doctor done by admin
export const registerDoctor = async (doctorData) => {
  const { name, email, password } = doctorData;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "DOCTOR",
      isVerified: true,         // ← doctors skip verification
    },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
};