/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only APIs
 */

import express from "express";
import {
  getAllPropertiesAdmin,
  approveProperty,
  rejectProperty,
  toggleFeaturedProperty,
  forceDeleteProperty,
} from "../controllers/admin.property.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =========================
   ADMIN PROPERTY CONTROLS
   Apply auth middleware to all routes
   ========================= */
router.use(authenticate);
router.use(authorize("ADMIN"));

// GET all properties (including pending/rejected)
router.get("/properties", getAllPropertiesAdmin);

// APPROVE property
router.patch("/properties/:id/approve", approveProperty);

// REJECT property (with reason)
router.patch("/properties/:id/reject", rejectProperty);

// TOGGLE featured status
router.patch("/properties/:id/feature", toggleFeaturedProperty);

// DELETE property permanently (hard delete)
router.delete("/properties/:id", forceDeleteProperty);

export default router;
