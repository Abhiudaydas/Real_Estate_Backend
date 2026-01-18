import express from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getNearbyProperties,
} from "../controllers/property.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

/* =========================
   PUBLIC ROUTES
   ========================= */
// Get nearby properties (public) - MUST BE BEFORE /:id
router.get("/nearby", getNearbyProperties);

// Get all approved properties (public)
router.get("/", getProperties);

// Get single property by ID (public)
router.get("/:id", getPropertyById);

/* =========================
   PROTECTED ROUTES (USER)
   ========================= */
// Get user's own properties
router.get("/my-properties", authenticate, getMyProperties);

// Create new property (with image upload)
router.post("/", authenticate, upload.array("images", 5), createProperty);

// Update property
router.patch("/:id", authenticate, upload.array("images", 5), updateProperty);

// Delete property (soft delete)
router.delete("/:id", authenticate, deleteProperty);

export default router;
