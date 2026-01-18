import mongoose from "mongoose";

const peakSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    elevation: { type: Number, required: true },
    mountainRange: {
      type: String,
      required: true,
      enum: [
        "Julijske Alpe",
        "Karavanke",
        "Kamniško-Savinjske Alpe",
        "Pohorje",
        "Ostale",
      ],
    },
    // GeoJSON format for geospatial queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude] - MongoDB GeoJSON order
        required: false,
      },
    },
    climbCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create 2dsphere index for geospatial queries
peakSchema.index({ location: "2dsphere" });

const Peak = mongoose.model("Peak", peakSchema);

export default Peak;
