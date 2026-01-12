import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import Property from "../models/property.model.js";
import { config } from "../config/index.js";

const connectDB = async () => {
  await mongoose.connect(config.mongoUri);
};

const seed = async () => {
  try {
    await connectDB();

    console.log("🌱 Seeding database...");

    await User.deleteMany();
    await Property.deleteMany();

    /* =========================
       USERS
       ========================= */
    const adminPassword = await bcrypt.hash("Admin@123", 12);
    const userPassword = await bcrypt.hash("User@123", 12);

    const admin = await User.create({
      name: "Admin",
      email: "admin@realestate.com",
      password: adminPassword,
      role: "ADMIN",
    });

    const user = await User.create({
      name: "John Doe",
      email: "user@realestate.com",
      password: userPassword,
      role: "USER",
    });

    /* =========================
   PROPERTIES
   ========================= */
    await Property.create([
      {
        title: "Luxury Villa",
        description: "4BHK luxury villa with garden",
        price: 8500000,
        type: "sell",
        category: "house",
        location: {
          address: "Sector 45",
          city: "Gurgaon",
          state: "Haryana",
          geo: {
            type: "Point",
            coordinates: [77.0266, 28.4595], // lng, lat
          },
        },
        owner: admin._id,
        isApproved: true,
      },
      {
        title: "2BHK Flat for Rent",
        description: "Near metro station",
        price: 25000,
        type: "rent",
        category: "flat",
        location: {
          address: "Whitefield",
          city: "Bangalore",
          state: "Karnataka",
          geo: {
            type: "Point",
            coordinates: [77.7499, 12.9698],
          },
        },
        owner: user._id,
        isApproved: true,
      },
    ]);

    console.log("✅ Seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed", error);
    process.exit(1);
  }
};

seed();
