const fs = require("fs");
const path = require("path");

// INPUT & OUTPUT
const inputFile = "kv-from-csv.json";
const outputDir = "states";

// Ensure output folder exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Load KV data
const data = JSON.parse(fs.readFileSync(inputFile, "utf8"));

const statesMap = {};

for (const [pincode, value] of Object.entries(data)) {
  const stateRaw = value.state || "unknown";
  const stateSlug = stateRaw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!statesMap[stateSlug]) {
    statesMap[stateSlug] = {};
  }

  statesMap[stateSlug][pincode] = value;
}

// Write state files
for (const [state, stateData] of Object.entries(statesMap)) {
  const filePath = path.join(outputDir, `${state}.json`);
  fs.writeFileSync(filePath, JSON.stringify(stateData, null, 2));
  console.log("Created:", filePath);
}

console.log("✅ State-wise split completed");
