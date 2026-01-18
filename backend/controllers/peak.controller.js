import Peak from "../models/Peak.js";
import { StatusCodes } from "http-status-codes";

// GET /peaks
export async function getPeaks(req, res) {
  const peaks = await Peak.find();
  res.status(StatusCodes.OK).json({ peaks });
}

// GET /peaks/:id
export async function getPeakDetails(req, res) {
  const peakId = req.params.id;

  const peak = await Peak.findById(peakId);
  if (!peak) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Peak not found" });
  }

  res.status(StatusCodes.OK).json({ peak });
}

export async function searchPeaks(req, res) {
  const query = req.query.q;
  // Logic to search peaks by name
  res.json({ query, results: [] });
}
