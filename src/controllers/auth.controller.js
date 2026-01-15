import User from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

/* REGISTER */
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    message: "User registered successfully",
  });
};

/* LOGIN */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: "Account disabled" });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax", // ✅ REQUIRED
      secure: false, // ✅ REQUIRED on localhost
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax", // ✅ REQUIRED
      secure: false, // ✅ REQUIRED on localhost
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ message: "Login successful" });
};

/* LOGOUT */
export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await User.updateOne({ refreshToken }, { $unset: { refreshToken: "" } });
  }

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out successfully" });
};

/* REFRESH TOKEN */
export const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  const user = await User.findOne({ refreshToken: token });
  if (!user) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const accessToken = generateAccessToken(user._id);

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .json({ message: "Token refreshed" });
};

/* ME */
export const me = async (req, res) => {
  res.json(req.user);
};
