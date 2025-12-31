const fs = require("fs");
const path = require("path");

const SITE_DIR = "site";

/* ---------------- SAFE WHITELIST ---------------- */

const SAFE_DIRS = new Set([
  "site",
  "data",
  "scripts",
  ".github",
  "node_modules",
]);

/* ---------------- STEP 1: DELETE ROOT SEO FOLDERS ---------------- */

const rootItems = fs.readdirSync(process.cwd(), { withFileTypes: true });

for (const item of rootItems) {
  if (!item.isDirectory()) continue;

  const name = item.name;

  // never touch safe dirs
  if (SAFE_DIRS.has(name)) continue;
  if (name.startsWith(".")) continue;

  /*
    SEO folders characteristics:
    - lowercase
    - contains hyphen OR numbers
    - generated earlier
  */
  const looksGenerated =
    name === name.toLowerCase() &&
    (name.includes("-") || /\d/.test(name));

  if (looksGenerated) {
    fs.rmSync(path.join(process.cwd(), name), {
      recursive: true,
      force: true,
    });
    console.log(`🧹 Deleted root folder: ${name}/`);
  }
}

/* delete old root index.html */
if (fs.existsSync("index.html")) {
  fs.rmSync("index.html", { force: true });
  console.log("🧹 Deleted root index.html");
}

/* ---------------- STEP 2: ENSURE site/ EXISTS ---------------- */

fs.mkdirSync(SITE_DIR, { recursive: true });

/* ---------------- STEP 3: HOMEPAGE ---------------- */

fs.writeFileSync(
  path.join(SITE_DIR, "index.html"),
  `<!DOCTYPE html>
<html>
<head>
  <title>India Pincode Directory</title>
</head>
<body>
<h1>India Pincode Directory</h1>
<p>Browse Indian pincodes by state, district and post office.</p>
</body>
</html>`
);

console.log("✅ Root SEO folders cleaned successfully");
