import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required!"],
    },
    friendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Friend ID is required!"],
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted"],
      default: "Pending",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

const Friend = mongoose.model("Friend", friendSchema);

export default Friend;
