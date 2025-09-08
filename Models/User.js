const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password_hash: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "seller",
    },
    resetCode: { type: String },
    resetCodeExpiry: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
