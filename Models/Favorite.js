const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    land_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Favorite", favoriteSchema);
