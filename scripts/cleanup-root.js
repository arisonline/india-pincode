const fs = require("fs");
const path = require("path");

/* ---------------- SAFE FOLDERS ---------------- */

const SAFE_DIRS = new Set([
  "site",
  "data",
  "scripts",
  ".github",
  "node_modules",
]);

/* ---------------- INDIAN STATES & UTs ---------------- */
/* Folder names MUST be lowercase */

const INDIAN_STATES = new Set([
  "andhra-pradesh",
  "arunachal-pradesh",
  "assam",
  "bihar",
  "chhattisgarh",
  "goa",
  "gujarat",
  "haryana",
  "himachal-pradesh",
  "jharkhand",
  "karnataka",
  "kerala",
  "madhya-pradesh",
  "maharashtra",
  "manipur",
  "meghalaya",
  "mizoram",
  "nagaland",
  "odisha",
  "punjab",
  "rajasthan",
  "sikkim",
  "tamil-nadu",
  "telangana",
  "tripura",
  "uttar-pradesh",
  "uttarakhand",
  "west-bengal",

  // Union Territories
  "andaman-nicobar-islands",
  "chandigarh",
  "dadra-nagar-haveli-daman-diu",
  "delhi",
  "jammu-kashmir",
  "ladakh",
  "lakshadweep",
  "puducherry",
]);

/* ---------------- CLEANUP ROOT ---------------- */

const root = process.cwd();
const items = fs.readdirSync(root, { withFileTypes: true });

for (const item of items) {
  if (!item.isDirectory()) continue;

  const name = item.name;

  // safety checks
  if (SAFE_DIRS.has(name)) continue;
  if (name.startsWith(".")) continue;

  // ✅ delete only real state/UT folders
  if (INDIAN_STATES.has(name)) {
    fs.rmSync(path.join(root, name), {
      recursive: true,
      force: true,
    });
    console.log(`🧹 Deleted state folder: ${name}`);
  }
}

/* delete root index.html if exists */
const rootIndex = path.join(root, "index.html");
if (fs.existsSync(rootIndex)) {
  fs.rmSync(rootIndex, { force: true });
  console.log("🧹 Deleted root index.html");
}

console.log("✅ Root state cleanup completed");
