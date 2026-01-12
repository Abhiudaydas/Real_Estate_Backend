/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only APIs
 */

/**
 * @swagger
 * /api/admin/properties:
 *   get:
 *     summary: Get all properties (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all properties
 */

import express from "express";
import {
  getAllPropertiesAdmin,
  approveProperty,
  toggleFeaturedProperty,
  forceDeleteProperty,
} from "../controllers/admin.property.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =========================
   ADMIN PROPERTY CONTROLS
   ========================= */
router.get(
  "/properties",
  authenticate,
  authorize("ADMIN"),
  getAllPropertiesAdmin
);

router.patch(
  "/properties/:id/approve",
  authenticate,
  authorize("ADMIN"),
  approveProperty
);

router.patch(
  "/properties/:id/feature",
  authenticate,
  authorize("ADMIN"),
  toggleFeaturedProperty
);

router.delete(
  "/properties/:id",
  authenticate,
  authorize("ADMIN"),
  forceDeleteProperty
);

export default router;
