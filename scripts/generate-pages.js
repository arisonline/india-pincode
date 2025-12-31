import fs from "fs";
import path from "path";

const dataDir = "data";
const siteDir = "site";

/* ----------------------------
   HELPERS
----------------------------- */

function slugify(text = "") {
  return text
    .toLowerCase()
    .replace(/\b(b\.?o\.?|s\.?o\.?|h\.?o\.?)\b/g, "")
    .replace(/\./g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/* ----------------------------
   STEP 1: AUTO DELETE ROOT STATE FOLDERS
----------------------------- */

const stateSlugs = new Set();

const dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith(".json"));

for (const file of dataFiles) {
  const rows = JSON.parse(
    fs.readFileSync(path.join(dataDir, file), "utf8")
  );

  for (const r of rows) {
    if (r.state) {
      stateSlugs.add(slugify(r.state));
    }
  }
}

// Delete root-level state folders
for (const state of stateSlugs) {
  const rootPath = path.join(state);
  if (fs.existsSync(rootPath)) {
    fs.rmSync(rootPath, { recursive: true, force: true });
    console.log(`🧹 Deleted root folder: ${state}/`);
  }
}

// Delete old root index.html (GitHub Pages leftover)
if (fs.existsSync("index.html")) {
  fs.rmSync("index.html");
  console.log("🧹 Deleted root index.html");
}

/* ----------------------------
   STEP 2: ENSURE site/ EXISTS
----------------------------- */

fs.mkdirSync(siteDir, { recursive: true });

/* ----------------------------
   STEP 3: GENERATE SITE
----------------------------- */

// Homepage
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

for (const file of dataFiles) {
  const rows = JSON.parse(
    fs.readFileSync(path.join(dataDir, file), "utf8")
  );

  for (const r of rows) {
    if (!r.pincode || !r.office || !r.state) continue;

    const state = slugify(r.state);
    const district = slugify(r.district || "unknown-district");
    const office = slugify(r.office);
    const pin = r.pincode;

    const dir = path.join(siteDir, state, district, office, pin);
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(
      path.join(dir, "index.html"),
      `<!DOCTYPE html>
<html>
<head>
  <title>${r.office}, ${r.state} – ${r.pincode}</title>
</head>
<body>
<h1>${r.office}</h1>
<ul>
  <li><b>Pincode:</b> ${r.pincode}</li>
  <li><b>District:</b> ${r.district}</li>
  <li><b>State:</b> ${r.state}</li>
  <li><b>Circle:</b> ${r.circle || ""}</li>
  <li><b>Region:</b> ${r.region || ""}</li>
</ul>
</body>
</html>`
    );
  }
}

console.log("✅ Root cleaned automatically & site generated");
