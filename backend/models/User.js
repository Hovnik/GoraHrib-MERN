import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required!"],
      maxlength: [20, "Username too long!"],
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required!"],
      minlength: [6, "Password must be at least 6 characters long!"],
      select: false, // Exclude password from query results by default
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
      maxlength: [100, "Email address too long!"],
      validate: {
        // Use validator library to check for valid email format
        validator: (value) => validator.isEmail(value),
        message: "Invalid email format!",
      },
      required: [true, "Email is required!"],
    },
    emailVerified: {
      type: Boolean,
      default: false,
      required: [true, "Verification status is required!"],
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    profilePicture: {
      url: { type: String },
      crop: {
        x: { type: Number },
        y: { type: Number },
        zoom: { type: Number },
      },
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
      required: [true, "User role is required!"],
    },
    friendsCount: { type: Number, default: 0 },
    achievementsCount: { type: Number, default: 0 },
    peaksCount: { type: Number, default: 0 },
    finishedPeaksCount: { type: Number, default: 0 },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
