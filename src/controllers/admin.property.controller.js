import Property from "../models/property.model.js";
import { deleteImage } from "../utils/image.service.js";

/* =========================
   GET ALL PROPERTIES (ADMIN)
   ========================= */
export const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find({ isDeleted: false })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({ properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

/* =========================
   APPROVE PROPERTY
   ========================= */
export const approveProperty = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("✅ Approving property:", id);

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.isApproved = true;
    property.rejectionReason = null; // Clear rejection reason if any
    await property.save();

    console.log("✅ Property approved successfully:", property._id);

    res.json({
      message: "Property approved successfully",
      property,
    });
  } catch (error) {
    console.error("❌ Error approving property:", error);
    res.status(500).json({ message: "Failed to approve property" });
  }
};

/* =========================
   REJECT PROPERTY
   ========================= */
export const rejectProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log("🚫 Rejecting property:", id);
    console.log("📝 Rejection reason:", reason);

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.isApproved = false;
    if (reason) {
      property.rejectionReason = reason;
    }
    await property.save();

    console.log("✅ Property rejected successfully:", property._id);

    res.json({
      message: "Property rejected successfully",
      property,
    });
  } catch (error) {
    console.error("❌ Error rejecting property:", error);
    res.status(500).json({ message: "Failed to reject property" });
  }
};

/* =========================
   FEATURE / UNFEATURE PROPERTY
   ========================= */
export const toggleFeaturedProperty = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error toggling featured:", error);
    res.status(500).json({ message: "Failed to toggle featured status" });
  }
};

/* =========================
   FORCE DELETE PROPERTY (HARD)
   ========================= */
export const forceDeleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    /* Delete images from Cloudinary if they exist */
    if (property.images && property.images.length > 0) {
      for (const img of property.images) {
        try {
          await deleteImage(img.public_id);
        } catch (imgError) {
          console.error("Error deleting image:", imgError);
          // Continue even if image deletion fails
        }
      }
    }

    await property.deleteOne();

    res.json({
      message: "Property permanently deleted",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Failed to delete property" });
  }
};
