import Property from "../models/property.model.js";

/* CREATE PROPERTY */
export const createProperty = async (req, res) => {
  const property = await Property.create({
    ...req.body,
    owner: req.user._id,
  });

  res.status(201).json({
    message: "Property created successfully",
    property,
  });
};

/* GET ALL PROPERTIES (PUBLIC) */
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
   GET MY PROPERTIES (USER)
   ========================= */
export const getMyProperties = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    owner: req.user._id,
    isDeleted: false,
  };

  const properties = await Property.find(filter)
    .skip(skip)
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

/* GET PROPERTY BY ID */
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

/* UPDATE PROPERTY */
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

  Object.assign(property, req.body);
  await property.save();

  res.json({
    message: "Property updated successfully",
    property,
  });
};

/* DELETE PROPERTY (SOFT) */
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

  property.isDeleted = true;
  await property.save();

  res.json({ message: "Property deleted successfully" });
};

/* ADMIN: APPROVE / CHANGE STATUS */
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
