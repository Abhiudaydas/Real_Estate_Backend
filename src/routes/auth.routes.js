import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  me,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticate, logout);
router.post("/refresh-token", refreshToken);
router.get("/me", authenticate, me);

export default router;
