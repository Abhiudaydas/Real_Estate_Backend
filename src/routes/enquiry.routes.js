/**
 * @swagger
 * tags:
 *   name: Enquiries
 *   description: Property enquiries
 */

/**
 * @swagger
 * /api/enquiries:
 *   post:
 *     summary: Create enquiry
 *     tags: [Enquiries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [propertyId, name, email, phone, message]
 *     responses:
 *       201:
 *         description: Enquiry submitted
 */

import express from "express";
import {
  createEnquiry,
  getMyEnquiries,
  getAllEnquiries,
  updateEnquiryStatus,
} from "../controllers/enquiry.controller.js";

import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* USER */
router.post("/", authenticate, createEnquiry);
router.get("/my", authenticate, getMyEnquiries);

/* ADMIN */
router.get("/admin", authenticate, authorize("ADMIN"), getAllEnquiries);
router.patch(
  "/admin/:id/status",
  authenticate,
  authorize("ADMIN"),
  updateEnquiryStatus
);

export default router;
