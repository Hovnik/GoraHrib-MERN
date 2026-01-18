import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required!"],
      trim: true,
      maxlength: [100, "Title too long!"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description too long!"],
    },
    badge: {
      type: String,
      trim: true,
    },
    criteria: {
      type: String,
      trim: true,
      maxlength: [300, "Criteria description too long!"],
    },
    rarity: {
      type: String,
      enum: ["Common", "Uncommon", "Rare", "Epic", "Legendary"],
      default: "Common",
      required: [true, "Rarity is required!"],
    },
  },
  { timestamps: true }
);

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;
