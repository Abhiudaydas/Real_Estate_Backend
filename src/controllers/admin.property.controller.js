import Property from "../models/property.model.js";
import { deleteImage } from "../utils/image.service.js";

/* =========================
   GET ALL PROPERTIES (ADMIN)
   ========================= */
export const getAllPropertiesAdmin = async (req, res) => {
  const properties = await Property.find()
    .populate("owner", "name email")
    .sort({ createdAt: -1 });

  res.json({ properties });
};

/* =========================
   APPROVE / REJECT PROPERTY
   ========================= */
export const approveProperty = async (req, res) => {
  const { isApproved } = req.body;

  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }

  property.isApproved = Boolean(isApproved);
  await property.save();

  res.json({
    message: `Property ${isApproved ? "approved" : "rejected"}`,
    property,
  });
};

/* =========================
   FEATURE / UNFEATURE PROPERTY
   ========================= */
export const toggleFeaturedProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }

  property.isFeatured = !property.isFeatured;
  await property.save();

  res.json({
    message: `Property ${
      property.isFeatured ? "featured" : "unfeatured"
    } successfully`,
    property,
  });
};

/* =========================
   FORCE DELETE PROPERTY (HARD)
   ========================= */
export const forceDeleteProperty = async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }

  /* Delete images from Cloudinary */
  for (const img of property.images) {
    await deleteImage(img.public_id);
  }

  await property.deleteOne();

  res.json({
    message: "Property permanently deleted",
  });
};
