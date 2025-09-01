const mongoose = require("mongoose");

const landSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true },
    size_acres: { type: Number, required: true },

    location: {
      county: { type: String, required: true },
      sub_county: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    documents: {
        title_deed_copy: { type: String },
        user_id_copy: { type: String },
    },

    status: {
      type: String,
      enum: ["available", "pending", "sold"],
      default: "available",
    },

    images: [{ type: String }], 

    verified: {
        type:Boolean,
        default:false
    },

    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Land", landSchema);
