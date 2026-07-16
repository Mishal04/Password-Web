const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    masterPasswordHash: {
  type: String,
  required: [true, "Master Password is required"],
},

    profilePicture: {
      type: String,
      default: "",
    },
    masterPasswordHash: {
  type: String,
  required: true,
},
  },
  
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);