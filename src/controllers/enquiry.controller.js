import Enquiry from "../models/enquiry.model.js";
import Property from "../models/property.model.js";

/* =========================
   CREATE ENQUIRY (USER)
   ========================= */
export const createEnquiry = async (req, res) => {
  const { propertyId, name, email, phone, message } = req.body;

  if (!propertyId || !name || !email || !phone || !message) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const property = await Property.findById(propertyId);

  if (!property || property.isDeleted || !property.isApproved) {
    return res.status(404).json({
      message: "Property not found",
    });
  }

  const enquiry = await Enquiry.create({
    property: propertyId,
    user: req.user ? req.user._id : null,
    name,
    email,
    phone,
    message,
  });

  res.status(201).json({
    message: "Enquiry submitted successfully",
    enquiry,
  });
};

/* =========================
   GET MY ENQUIRIES (USER)
   ========================= */
export const getMyEnquiries = async (req, res) => {
  const enquiries = await Enquiry.find({ user: req.user._id })
    .populate("property", "title price location.city")
    .sort({ createdAt: -1 });

  res.json({ enquiries });
};

/* =========================
   GET ALL ENQUIRIES (ADMIN)
   ========================= */
export const getAllEnquiries = async (req, res) => {
  const enquiries = await Enquiry.find()
    .populate("property", "title")
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json({ enquiries });
};

/* =========================
   UPDATE ENQUIRY STATUS (ADMIN)
   ========================= */
export const updateEnquiryStatus = async (req, res) => {
  const { status } = req.body;

  if (!["new", "contacted", "closed"].includes(status)) {
    return res.status(400).json({
      message: "Invalid status",
    });
  }

  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return res.status(404).json({ message: "Enquiry not found" });
  }

  enquiry.status = status;
  await enquiry.save();

  res.json({
    message: "Enquiry status updated",
    enquiry,
  });
};
