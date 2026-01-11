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

import { upload } from "../middlewares/upload.middleware.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =========================
   USER — CREATE PROPERTY (WITH IMAGES)
   ========================= */
router.post(
  "/",
  upload.array("images", 5), // ✅ MUST BE HERE
  authenticate,
  createProperty
);

/* =========================
   USER — MY PROPERTIES
   ========================= */
router.get("/my", authenticate, getMyProperties);

/* =========================
   PUBLIC
   ========================= */
router.get("/", getProperties);
router.get("/:id", getPropertyById);

/* =========================
   OWNER / ADMIN — UPDATE
   ========================= */
router.patch("/:id", upload.array("images", 5), authenticate, updateProperty);

/* =========================
   OWNER / ADMIN — DELETE
   ========================= */
router.delete("/:id", authenticate, deleteProperty);

/* =========================
   ADMIN — APPROVE / STATUS
   ========================= */
router.patch(
  "/admin/:id/status",
  authenticate,
  authorize("ADMIN"),
  updatePropertyStatus
);

export default router;
