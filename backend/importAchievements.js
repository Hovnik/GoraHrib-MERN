import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Achievement from "./models/Achievement.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importAchievements() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log("✓ Cleared existing achievements");

    // JSON file to import (located in parent directory)
    const filePath = path.join(__dirname, "../data/achievements.json");

    if (!fs.existsSync(filePath)) {
      console.log(`⚠ File not found: ${filePath}`);
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`\nProcessing achievements.json...`);

    const achievementsToInsert = [];

    for (const achievement of data) {
      achievementsToInsert.push({
        title: achievement.title,
        description: achievement.description,
        badge: achievement.badge,
        criteria: achievement.criteria,
        rarity: achievement.rarity,
      });
    }

    if (achievementsToInsert.length > 0) {
      // Insert achievements one by one to handle duplicates gracefully
      let imported = 0;
      let duplicates = 0;

      for (const achievement of achievementsToInsert) {
        try {
          await Achievement.create(achievement);
          imported++;
        } catch (error) {
          if (error.code === 11000) {
            // Duplicate key error - skip it
            duplicates++;
          } else {
            throw error;
          }
        }
      }

      console.log(
        `  ✓ Imported ${imported} achievements${
          duplicates > 0 ? ` (${duplicates} duplicates skipped)` : ""
        }`
      );
    }

    console.log(`\n✅ Import complete!`);
    console.log(
      `   Total achievements imported: ${achievementsToInsert.length}`
    );

    process.exit(0);
  } catch (error) {
    console.error("Error importing achievements:", error);
    process.exit(1);
  }
}

importAchievements();
