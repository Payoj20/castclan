import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import prisma from "../prisma.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

//Signup
export const signup = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }
  try {
    const { email, username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        username: username.trim(),
        password_hash: hashedPassword,
      },
    });

    res
      .status(201)
      .json({ message: "Account created successfully. Please login." });
  } catch (error) {
    if (error.code === "P2002") {
      const field = error.meta?.target?.includes("email")
        ? "Email"
        : "Username";
      console.error("Signup error", error);
      return res
        .status(400)
        .json({
          message: `This ${field} is already registered. Please sign in or use a different one.`,
        });
    }
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

//Login
export const login = async (req, res) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, COOKIE_OPTIONS);

    res.json({
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

//Profile
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("getProfile", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ message: "Logged out successfully." });
};
