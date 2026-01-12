/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Property management APIs
 */

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create property (with images)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - type
 *               - category
 *               - latitude
 *               - longitude
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               type:
 *                 type: string
 *               category:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Property created
 */

/**
 * @swagger
 * /api/properties/nearby:
 *   get:
 *     summary: Get nearby properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *     responses:
 *       200:
 *         description: Nearby properties list
 */

import express from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getMyProperties,
  getNearbyProperties,
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
router.get("/nearby", getNearbyProperties);
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
