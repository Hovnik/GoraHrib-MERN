import mongoose from "mongoose";

const checklistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required!"],
    },
    peakId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Peak",
      required: [true, "Peak ID is required!"],
    },
    status: {
      type: String,
      enum: ["Wishlist", "Visited"],
      default: "Wishlist",
    },
    visitedDate: { type: Date },
    pictures: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const Checklist = mongoose.model("Checklist", checklistSchema);

export default Checklist;
