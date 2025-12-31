const fs = require("fs");
const path = require("path");

const DATA_DIR = "data";
const SITE_DIR = "site";

/* ---------------- HELPERS ---------------- */

function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\b(b\.?o\.?|s\.?o\.?|h\.?o\.?)\b/g, "")
    .replace(/\./g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/* ---------------- READ DATA FILES ---------------- */

let dataFiles = [];
if (fs.existsSync(DATA_DIR)) {
  dataFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
}

/* ---------------- COLLECT STATE SLUGS ---------------- */

const stateSlugs = new Set();

for (const file of dataFiles) {
  try {
    const rows = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, file), "utf8")
    );

    if (Array.isArray(rows)) {
      for (const r of rows) {
        if (r && r.state) {
          stateSlugs.add(slugify(r.state));
        }
      }
    }
  } catch {
    // ignore bad JSON
  }
}

/* ---------------- DELETE ROOT STATE FOLDERS ONLY ---------------- */

for (const state of stateSlugs) {
  // SAFETY: never touch site/
  if (state === SITE_DIR) continue;

  const rootPath = path.join(process.cwd(), state);

  if (fs.existsSync(rootPath) && fs.statSync(rootPath).isDirectory()) {
    fs.rmSync(rootPath, { recursive: true, force: true });
    console.log("🧹 Deleted root folder:", state);
  }
}

/* delete old root index.html if exists */
const rootIndex = path.join(process.cwd(), "index.html");
if (fs.existsSync(rootIndex)) {
  fs.rmSync(rootIndex, { force: true });
  console.log("🧹 Deleted root index.html");
}

/* ---------------- ENSURE site/ EXISTS ---------------- */

if (!fs.existsSync(SITE_DIR)) {
  fs.mkdirSync(SITE_DIR, { recursive: true });
}

/* ---------------- HOMEPAGE ---------------- */

fs.writeFileSync(
  path.join(SITE_DIR, "index.html"),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>India Pincode Directory</title>
</head>
<body>
<h1>India Pincode Directory</h1>
<p>Search Indian pincodes by state, district and post office.</p>
</body>
</html>`
);

/* ---------------- GENERATE PINCODE PAGES ---------------- */

for (const file of dataFiles) {
  let rows = [];
  try {
    rows = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, file), "utf8")
    );
  } catch {
    continue;
  }

  if (!Array.isArray(rows)) continue;

  for (const r of rows) {
    try {
      if (!r || !r.pincode || !r.office || !r.state) continue;

      const state = slugify(r.state);
      const district = slugify(r.district || "unknown-district");
      const office = slugify(r.office);
      const pin = String(r.pincode);

      const dir = path.join(SITE_DIR, state, district, office, pin);
      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(
        path.join(dir, "index.html"),
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${r.office}, ${r.state} – ${pin}</title>
</head>
<body>
<h1>${r.office}</h1>
<ul>
  <li><b>Pincode:</b> ${pin}</li>
  <li><b>District:</b> ${r.district}</li>
  <li><b>State:</b> ${r.state}</li>
  <li><b>Circle:</b> ${r.circle || ""}</li>
  <li><b>Region:</b> ${r.region || ""}</li>
</ul>
</body>
</html>`
      );
    } catch {
      // skip bad row
    }
  }
}

console.log("✅ Build finished successfully");
