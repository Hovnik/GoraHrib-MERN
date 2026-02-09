import Checklist from "../models/Checklist.js";
import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../utils/api-error.js";
import { executeTransaction } from "../utils/transaction-helper.js";
import { checkAndAwardAchievements } from "../utils/achievement-service.js";
import mongoose from "mongoose";
import {
  uploadToFirebase,
  deleteMultipleFromFirebase,
} from "../utils/firebase-storage.js";

// GET /checklist/
export async function getChecklist(req, res) {
  const userId = req.user.id;

  const checklist = await Checklist.find({ userId })
    .populate("peakId", "name elevation mountainRange location")
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({ checklist });
}

// POST /checklist/:peakId
export async function addPeakToChecklist(req, res) {
  const peakId = req.params.peakId;
  const userId = req.user.id;

  const existingItem = await Checklist.findOne({ userId, peakId });
  if (existingItem) {
    throw new BadRequestError("Peak already in checklist");
  }

  const newChecklistItem = {
    userId,
    peakId,
    status: "Wishlist",
  };

  const createdItem = await executeTransaction(async (session) => {
    const [item] = await Checklist.create([newChecklistItem], { session });
    await User.updateOne(
      { _id: userId },
      { $inc: { peaksCount: 1 } },
      { session },
    );
    return item; // return created item
  });

  res.status(StatusCodes.CREATED).json({
    id: createdItem._id,
    message: "Peak added to checklist",
  });
}

// DELETE /checklist/:peakId
export async function removePeakFromChecklist(req, res) {
  const peakId = req.params.peakId;
  const userId = req.user.id;

  let revokedAchievements = [];

  await executeTransaction(async (session) => {
    const item = await Checklist.findOneAndDelete(
      { userId, peakId },
      { session },
    );
    if (!item) {
      throw new NotFoundError("Peak not found in checklist");
    }

    // Delete associated pictures from Firebase Storage if they exist
    if (item.pictures && item.pictures.length > 0) {
      await deleteMultipleFromFirebase(item.pictures);
    }

    if (item.status === "Visited") {
      await User.updateOne(
        { _id: userId },
        { $inc: { finishedPeaksCount: -1 } },
        { session },
      );

      // Revoke any achievements that no longer meet criteria
      const { revokeAchievementsIfNeeded } =
        await import("../utils/achievement-service.js");
      revokedAchievements = await revokeAchievementsIfNeeded(userId, session);
    }

    await User.updateOne(
      { _id: userId },
      { $inc: { peaksCount: -1 } },
      { session },
    );

    return item;
  });

  const response = { message: `Peak ${peakId} removed from checklist` };
  if (revokedAchievements.length > 0) {
    response.revokedAchievements = revokedAchievements.map((a) => ({
      id: a._id,
      title: a.title,
      rarity: a.rarity,
    }));
  }

  res.json(response);
}

// PUT /checklist/:peakId/visit
export async function markPeakAsVisited(req, res) {
  const peakId = req.params.peakId;
  const userId = req.user.id;

  const checklistItem = await Checklist.findOne({ userId, peakId });
  if (!checklistItem) {
    throw new NotFoundError("Peak not found in checklist");
  }

  if (checklistItem.status === "Visited") {
    throw new BadRequestError("Peak already marked as visited");
  }

  let newAchievements = [];

  await executeTransaction(async (session) => {
    await Checklist.updateOne(
      { userId, peakId },
      { $set: { status: "Visited", visitedDate: new Date() } },
      { session },
    );

    await User.updateOne(
      { _id: userId },
      { $inc: { finishedPeaksCount: 1 } },
      { session },
    );

    // Check and award achievements after updating stats
    newAchievements = await checkAndAwardAchievements(userId, session);
  });

  const response = {
    message: `Peak ${peakId} marked as visited`,
  };

  if (newAchievements.length > 0) {
    response.newAchievements = newAchievements.map((achievement) => ({
      title: achievement.title,
      badge: achievement.badge,
      rarity: achievement.rarity,
    }));
  }

  res.json(response);
}

// PUT /checklist/:peakId/pictures
export async function addPicturesToVisitedPeak(req, res) {
  const peakId = req.params.peakId;
  const userId = req.user.id;

  const checklistItem = await Checklist.findOne({ userId, peakId });
  if (!checklistItem) {
    throw new NotFoundError("Peak not found in checklist");
  }

  if (checklistItem.status !== "Visited") {
    throw new BadRequestError(
      "Peak must be marked as visited before adding pictures",
    );
  }

  // Parse existing pictures to keep from request body
  let existingPicturesToKeep = [];
  if (req.body.existingPictures) {
    try {
      existingPicturesToKeep = JSON.parse(req.body.existingPictures);
    } catch (error) {
      console.error("Error parsing existingPictures:", error);
    }
  }

  // Upload new pictures to Firebase
  let newPictureUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadToFirebase(
        file.buffer,
        file.originalname,
        "peak-pictures",
        file.mimetype,
      ),
    );
    newPictureUrls = await Promise.all(uploadPromises);
  }

  // Combine kept existing pictures + new pictures
  const allPictures = [...existingPicturesToKeep, ...newPictureUrls];

  // Validate total doesn't exceed 3
  if (allPictures.length > 3) {
    // Delete the newly uploaded pictures since we're rejecting the request
    if (newPictureUrls.length > 0) {
      await deleteMultipleFromFirebase(newPictureUrls);
    }
    throw new BadRequestError("Maximum 3 pictures allowed");
  }

  // Find pictures to delete (pictures in DB that are not in the kept list)
  const picturesToDelete = checklistItem.pictures.filter(
    (pic) => !existingPicturesToKeep.includes(pic),
  );

  // Delete removed pictures from Firebase Storage
  if (picturesToDelete.length > 0) {
    await deleteMultipleFromFirebase(picturesToDelete);
  }

  // Update checklist item with new pictures array (replaces entire array)
  await Checklist.updateOne(
    { userId, peakId },
    { $set: { pictures: allPictures } },
  );

  res.json({
    message: `Pictures updated for peak ${peakId}`,
    pictures: allPictures,
  });
}
