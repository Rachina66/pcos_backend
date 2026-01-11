import prisma from "../../config/prismaclient.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/jwt.utils.js";

const SALT_ROUNDS = 10;

// REGISTER
export const register = async ({ name, email, password, role }) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user in DB
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "USER",
    },
  });

  // Generate JWT token
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

// LOGIN
export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

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

// GET USER BY ID
export const getUserById = async (id) => {
  return prisma.user.findUnique({ where: { id } });
};
