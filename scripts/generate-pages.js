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

/* ---------------- STEP 1: READ STATE SLUGS FROM DATA ---------------- */

const stateSlugs = new Set();

if (fs.existsSync(DATA_DIR)) {
  const dataFiles = fs
    .readdirSync(DATA_DIR)
    .filter(f => f.endsWith(".json"));

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
}

/* ---------------- STEP 2: SCAN ROOT FOLDERS ---------------- */

const rootItems = fs.readdirSync(process.cwd(), { withFileTypes: true });

for (const item of rootItems) {
  if (!item.isDirectory()) continue;

  const folderName = item.name;

  // 🔒 SAFETY RULES
  if (folderName === SITE_DIR) continue;
  if (folderName.startsWith(".")) continue;
  if (folderName === "data") continue;
  if (folderName === "scripts") continue;
  if (folderName === "node_modules") continue;

  // ✅ Delete only if folder matches a state slug
  if (stateSlugs.has(folderName)) {
    fs.rmSync(path.join(process.cwd(), folderName), {
      recursive: true,
      force: true,
    });
    console.log(`🧹 Deleted root state folder: ${folderName}/`);
  }
}

/* ---------------- STEP 3: DELETE OLD ROOT index.html ---------------- */

const rootIndex = path.join(process.cwd(), "index.html");
if (fs.existsSync(rootIndex)) {
  fs.rmSync(rootIndex, { force: true });
  console.log("🧹 Deleted old root index.html");
}

/* ---------------- STEP 4: ENSURE site/ EXISTS ---------------- */

fs.mkdirSync(SITE_DIR, { recursive: true });

/* ---------------- STEP 5: HOMEPAGE ---------------- */

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

/* ---------------- STEP 6: GENERATE PINCODE PAGES ---------------- */

if (fs.existsSync(DATA_DIR)) {
  const dataFiles = fs
    .readdirSync(DATA_DIR)
    .filter(f => f.endsWith(".json"));

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
        // skip broken row
      }
    }
  }
}

console.log("✅ Root state folders detected & cleaned correctly");
