import express from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getMyProperties,
} from "../controllers/property.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* USER */
router.post("/", authenticate, createProperty);
router.get("/my", authenticate, getMyProperties);

/* PUBLIC */
router.get("/", getProperties);
router.get("/:id", getPropertyById);

/* OWNER / ADMIN */
router.patch("/:id", authenticate, updateProperty);
router.delete("/:id", authenticate, deleteProperty);

/* ADMIN */
router.patch(
  "/admin/:id/status",
  authenticate,
  authorize("ADMIN"),
  updatePropertyStatus
);

export default router;
