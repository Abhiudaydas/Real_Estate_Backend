import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["sell", "rent"],
      required: true,
    },

    category: {
      type: String,
      enum: ["land", "house", "flat", "commercial"],
      required: true,
    },

    location: {
      address: String,
      city: String,
      state: String,

      geo: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },

    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "sold", "rented"],
      default: "available",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* =========================
   GEO INDEX (CRITICAL)
   ========================= */
propertySchema.index({ "location.geo": "2dsphere" });

export default mongoose.model("Property", propertySchema);
