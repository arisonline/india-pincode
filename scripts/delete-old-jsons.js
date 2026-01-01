const fs = require("fs");
const path = require("path");

const dataDir = "data";

if (!fs.existsSync(dataDir)) {
  console.log("No data folder found");
  process.exit(0);
}

const files = fs.readdirSync(dataDir);

let deleted = 0;

for (const file of files) {
  if (
    file.endsWith(".json") &&
    file !== "pincode.csv"
  ) {
    fs.unlinkSync(path.join(dataDir, file));
    console.log("Deleted:", file);
    deleted++;
  }
}

console.log(`✅ Deleted ${deleted} old state JSON files`);
