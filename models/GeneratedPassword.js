const mongoose = require("mongoose");

const generatedPasswordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    strength: {
      type: String,
      enum: ["Weak", "Medium", "Strong", "Very Strong"],
      default: "Medium",
    },

    length: {
      type: Number,
      required: true,
      min: 8,
      max: 64,
    },

    // Options snapshot
    options: {
      uppercase:        { type: Boolean, default: true  },
      lowercase:        { type: Boolean, default: true  },
      numbers:          { type: Boolean, default: true  },
      symbols:          { type: Boolean, default: true  },
      excludeSimilar:   { type: Boolean, default: false },
      excludeAmbiguous: { type: Boolean, default: false },
    },

    // null means manually configured, otherwise the preset name
    preset: {
      type: String,
      default: null,
    },

    entropy: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire history — keep only 30 days of records per user (optional)
generatedPasswordSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model("GeneratedPassword", generatedPasswordSchema);
