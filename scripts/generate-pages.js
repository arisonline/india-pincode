import fs from "fs";
import path from "path";

const dataDir = "data";
const siteDir = "site";

/* ----------------------------
   HELPERS
----------------------------- */

function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/\b(b\.?o\.?|s\.?o\.?|h\.?o\.?)\b/g, "")
    .replace(/\./g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/* ----------------------------
   STEP 1: AUTO DELETE ROOT STATE FOLDERS (SAFE)
----------------------------- */

const stateSlugs = new Set();

let dataFiles = [];
try {
  dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith(".json"));
} catch (e) {
  console.error("❌ Cannot read data directory:", e.message);
  process.exit(1);
}

for (const file of dataFiles) {
  try {
    const rows = JSON.parse(
      fs.readFileSync(path.join(dataDir, file), "utf8")
    );

    for (const r of rows) {
      if (r && r.state) {
        stateSlugs.add(slugify(r.state));
      }
    }
  } catch (e) {
    console.warn(`⚠️ Skipping bad JSON file: ${file}`);
  }
}

for (const state of stateSlugs) {
  try {
    const rootPath = path.join(state);
    if (fs.existsSync(rootPath)) {
      fs.rmSync(rootPath, { recursive: true, force: true });
      console.log(`🧹 Deleted root folder: ${state}/`);
    }
  } catch (e) {
    console.warn(`⚠️ Could not delete ${state}/ — skipped`);
  }
}

try {
  if (fs.existsSync("index.html")) {
    fs.rmSync("index.html");
    console.log("🧹 Deleted root index.html");
  }
} catch (e) {
  console.warn("⚠️ Could not delete root index.html");
}

/* ----------------------------
   STEP 2: ENSURE site/ EXISTS
----------------------------- */

try {
  fs.mkdirSync(siteDir, { recursive: true });
} catch (e) {
  console.error("❌ Cannot create site directory:", e.message);
  process.exit(1);
}

/* ----------------------------
   STEP 3: HOMEPAGE
----------------------------- */

fs.writeFileSync(
  path.join(siteDir, "index.html"),
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

/* ----------------------------
   STEP 4: GENERATE PAGES (SAFE)
----------------------------- */

for (const file of dataFiles) {
  let rows = [];
  try {
    rows = JSON.parse(
      fs.readFileSync(path.join(dataDir, file), "utf8")
    );
  } catch {
    continue;
  }

  for (const r of rows) {
    try {
      if (!r || !r.pincode || !r.office || !r.state) continue;

      const state = slugify(r.state);
      const district = slugify(r.district || "unknown-district");
      const office = slugify(r.office);
      const pin = String(r.pincode);

      const dir = path.join(siteDir, state, district, office, pin);
      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(
        path.join(dir, "index.html"),
        `<!DOCTYPE html>
<html>
<head>
  <title>${r.office}, ${r.state} – ${pin}</title>
</head>
<body>
<h1>${r.office}</h1>
<ul>
  <li><b>Pincode:</b> ${pin}</li>
  <li><b>District:</b> ${r.district}</li>
  <li><b>State:</b> ${r.state}</li>
</ul>
</body>
</html>`
      );
    } catch {
      // skip broken row
    }
  }
}

console.log("✅ Build completed safely (no crashes)");
