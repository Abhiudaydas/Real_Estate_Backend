import Property from "../models/property.model.js";
import { uploadImage, deleteImage } from "../utils/image.service.js";

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
        address: req.body["location[address]"] || "N/A",
        city: req.body["location[city]"] || "N/A",
        state: req.body["location[state]"] || "N/A",
        geo: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
      },
      images: [],
    });

    return res.status(201).json({
      message: "Property created",
      property,
    });
  } catch (err) {
    console.error("🔥 CREATE PROPERTY CRASH 🔥");
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
};

/* =========================
   GET MY PROPERTIES
   ========================= */
export const getMyProperties = async (req, res) => {
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
};

/* =========================
   GET PROPERTY BY ID
   ========================= */
export const getPropertyById = async (req, res) => {
  const property = await Property.findOne({
    _id: req.params.id,
    isDeleted: false,
    isApproved: true,
  }).populate("owner", "name email");

  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }

  res.json(property);
};

/* =========================
   UPDATE PROPERTY
   ========================= */
export const updateProperty = async (req, res) => {
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

  /* Upload new images */
  if (req.files?.length) {
    for (const file of req.files) {
      const uploaded = await uploadImage(file.buffer);
      property.images.push(uploaded);
    }
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
};

/* =========================
   DELETE PROPERTY
   ========================= */
export const deleteProperty = async (req, res) => {
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

  for (const img of property.images) {
    await deleteImage(img.public_id);
  }

  property.isDeleted = true;
  await property.save();

  res.json({ message: "Property deleted successfully" });
};

/* =========================
   ADMIN: APPROVE / STATUS
   ========================= */
export const updatePropertyStatus = async (req, res) => {
  const { isApproved, status } = req.body;

  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({ message: "Property not found" });
  }

  if (typeof isApproved === "boolean") {
    property.isApproved = isApproved;
  }

  if (status) {
    property.status = status;
  }

  await property.save();

  res.json({
    message: "Property status updated",
    property,
  });
};

/* =========================
   GET NEARBY PROPERTIES
   ========================= */
export const getNearbyProperties = async (req, res) => {
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
};
