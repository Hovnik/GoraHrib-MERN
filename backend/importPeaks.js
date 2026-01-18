import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Peak from "./models/Peak.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map JSON file mountain ranges to database enum values
const mountainRangeMapping = {
  "Julijske Alpe": "Julijske Alpe",
  Karavanke: "Karavanke",
  "Kamniško Savinjske Alpe": "Kamniško-Savinjske Alpe",
  Pohorje: "Pohorje",
  // Add any other ranges that should map to "Ostale"
};

async function importPeaks() {
  try {
    await connectDB();
    console.log("Connected to database");

    // Clear existing peaks
    await Peak.deleteMany({});
    console.log("✓ Cleared existing peaks");

    // JSON files to import (located in parent directory)
    const jsonFiles = [
      "../data/julijske_alpe.json",
      "../data/karavanke.json",
      "../data/kamnisko_savinjske_alpe.json",
      "../data/pohorje_dravinjske_gorice_in_haloze.json",
      "../data/gorisko_notranjsko_in_sneznisko_hribovje.json",
      "../data/skofjelosko_cerkljansko_hribovje_in_jelovica.json",
      "../data/polhograjsko_hribovje_in_ljubljana.json",
      "../data/posavsko_hribovje_in_dolenjska.json",
      "../data/strojna_kosenjak_kozjak_in_slovenske_gorice.json",
      "../data/prekmurje.json",
    ];

    let totalPeaks = 0;
    let skippedPeaks = 0;

    for (const file of jsonFiles) {
      const filePath = path.join(__dirname, file);

      if (!fs.existsSync(filePath)) {
        console.log(`⚠ File not found: ${file}`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      console.log(`\nProcessing ${path.basename(file)}...`);

      const peaksToInsert = [];

      for (const peak of data) {
        // Skip peaks without coordinates
        if (!peak.latitude || !peak.longitude) {
          skippedPeaks++;
          continue;
        }

        // Map mountain range to database enum
        const mountainRange =
          mountainRangeMapping[peak.mountain_range] || "Ostale";

        peaksToInsert.push({
          name: peak.name,
          elevation: peak.elevation,
          mountainRange: mountainRange,
          location: {
            type: "Point",
            coordinates: [peak.longitude, peak.latitude], // GeoJSON format: [lng, lat]
          },
          climbCount: 0,
        });
      }

      if (peaksToInsert.length > 0) {
        // Insert peaks one by one to handle duplicates gracefully
        let imported = 0;
        let duplicates = 0;

        for (const peak of peaksToInsert) {
          try {
            await Peak.create(peak);
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
          `  ✓ Imported ${imported} peaks${
            duplicates > 0 ? ` (${duplicates} duplicates skipped)` : ""
          }`
        );
        totalPeaks += imported;
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   Total peaks imported: ${totalPeaks}`);
    console.log(`   Peaks skipped (no coordinates): ${skippedPeaks}`);

    process.exit(0);
  } catch (error) {
    console.error("Error importing peaks:", error);
    process.exit(1);
  }
}

importPeaks();
