const mongoose = require("mongoose");

const vaultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      default: "",
    },

    encryptedPassword: {
      type: String,
      required: true,
    },

    iv: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "Personal",
    },

    notes: {
      type: String,
      default: "",
    },

    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vault", vaultSchema);