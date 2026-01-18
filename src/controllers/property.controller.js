import Property from "../models/property.model.js";
import { deleteImage } from "../utils/image.service.js";

/* =========================
   CREATE PROPERTY (WITH IMAGES + GEO)
   ========================= */
export const createProperty = async (req, res) => {
  try {
    console.log("========== CREATE PROPERTY ==========");
    console.log("REQ.USER:", req.user);
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILES:", req.files);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized (no req.user)" });
    }

    const { title, description, price, type, category, latitude, longitude } =
      req.body;

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        message: "Invalid latitude or longitude",
      });
    }

    const property = await Property.create({
      title,
      description,
      price,
      type,
      category,
      owner: req.user._id,
      location: {
        address: req.body["location[address]"] || req.body.address || "N/A",
        city: req.body["location[city]"] || req.body.city || "N/A",
        state: req.body["location[state]"] || req.body.state || "N/A",
        geo: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
      },
      images: [],
    });

    return res.status(201).json({
      message: "Property created successfully. Waiting for admin approval.",
      property,
    });
  } catch (err) {
    console.error("🔥 CREATE PROPERTY ERROR 🔥");
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

/* =========================
   GET ALL PROPERTIES (PUBLIC)
   ========================= */
export const getProperties = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {
      isDeleted: false,
      isApproved: true,
    };

    if (req.query.type) filters.type = req.query.type;
    if (req.query.category) filters.category = req.query.category;
    if (req.query.city) filters["location.city"] = req.query.city;

    if (req.query.minPrice || req.query.maxPrice) {
      filters.price = {};
      if (req.query.minPrice) filters.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filters.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.search) {
      filters.title = { $regex: req.query.search, $options: "i" };
    }

    const properties = await Property.find(filters)
      .populate("owner", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(filters);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalProperties: total,
      properties,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

/* =========================
   GET MY PROPERTIES
   ========================= */
export const getMyProperties = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filter = {
      owner: req.user._id,
      isDeleted: false,
    };

    const properties = await Property.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(filter);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalProperties: total,
      properties,
    });
  } catch (error) {
    console.error("Error fetching my properties:", error);
    res.status(500).json({ message: "Failed to fetch properties" });
  }
};

/* =========================
   GET PROPERTY BY ID
   ========================= */
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("owner", "name email");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ property });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ message: "Failed to fetch property" });
  }
};

/* =========================
   UPDATE PROPERTY
   ========================= */
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property || property.isDeleted) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (
      property.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    /* Update allowed fields only */
    const allowedFields = [
      "title",
      "description",
      "price",
      "type",
      "category",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    /* Update geo */
    if (req.body.latitude && req.body.longitude) {
      property.location.geo.coordinates = [
        Number(req.body.longitude),
        Number(req.body.latitude),
      ];
    }

    await property.save();

    res.json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Failed to update property" });
  }
};

/* =========================
   DELETE PROPERTY
   ========================= */
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (
      property.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Soft delete
    property.isDeleted = true;
    await property.save();

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Failed to delete property" });
  }
};

/* =========================
   GET NEARBY PROPERTIES
   ========================= */
export const getNearbyProperties = async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const properties = await Property.find({
      isDeleted: false,
      isApproved: true,
      "location.geo": {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(radius) * 1000,
        },
      },
    }).populate("owner", "name email");

    res.json({
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Error fetching nearby properties:", error);
    res.status(500).json({ message: "Failed to fetch nearby properties" });
  }
};
