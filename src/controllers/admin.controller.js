import User from "../models/user.model.js";

/* =========================
   GET ALL USERS (PAGINATED)
   ========================= */
export const getAllUsers = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find({ isDeleted: false })
    .select("-password -refreshToken")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments({ isDeleted: false });

  res.json({
    page,
    totalPages: Math.ceil(total / limit),
    totalUsers: total,
    users,
  });
};

/* =========================
   GET SINGLE USER
   ========================= */
export const getUserById = async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).select("-password -refreshToken");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

/* =========================
   UPDATE USER (ROLE / STATUS)
   ========================= */
export const updateUser = async (req, res) => {
  const { role, isActive } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { role, isActive },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    message: "User updated successfully",
    user,
  });
};

/* =========================
   SOFT DELETE USER
   ========================= */
export const deleteUser = async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    return res.status(400).json({
      message: "Admin cannot delete their own account",
    });
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true, isActive: false },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ message: "User deleted successfully" });
};
