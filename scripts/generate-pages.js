import fs from "fs";
import path from "path";

const dataDir = "data";
const outDir = "public";

/**
 * Clean post office name ONLY for URL
 * Example:
 * "Sindrani S.O" → "sindrani"
 * "Nataberia B.O" → "nataberia"
 */
function cleanOfficeForUrl(name) {
  return name
    .toLowerCase()
    .replace(/\b(b\.?o\.?|s\.?o\.?|h\.?o\.?)\b/g, "") // remove BO, SO, HO
    .replace(/\./g, "")                               // remove dots
    .trim()
    .replace(/\s+/g, "-")                             // spaces → hyphen
    .replace(/[^a-z0-9-]/g, "");                      // safe chars only
}

/**
 * General slug for state / district
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\./g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function pageTemplate(d) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${d.office}, ${d.district}, ${d.state} – Pincode ${d.pincode}</title>
  <meta name="description" content="Pincode ${d.pincode} of ${d.office}, ${d.district}, ${d.state}. Official India Post details.">
  <meta name="robots" content="index, follow">
</head>
<body>

<h1>${d.office}</h1>

<ul>
  <li><b>Pincode:</b> ${d.pincode}</li>
  <li><b>Post Office:</b> ${d.office}</li>
  <li><b>District:</b> ${d.district}</li>
  <li><b>State:</b> ${d.state}</li>
  <li><b>Circle:</b> ${d.circle}</li>
  <li><b>Region:</b> ${d.region}</li>
</ul>

<hr>
<p>Data Source: Department of Posts, Government of India (data.gov.in)</p>

</body>
</html>`;
}

// Read all state JSON files
const files = fs.readdirSync(dataDir).filter(f =>
  f.endsWith(".json") && !f.startsWith("state-map")
);

for (const file of files) {
  const records = JSON.parse(
    fs.readFileSync(path.join(dataDir, file), "utf8")
  );

  for (const r of records) {
    if (!r.pincode || !r.office || !r.state || !r.district) continue;

    const stateSlug = slugify(r.state);
    const districtSlug = slugify(r.district);
    const officeSlug = cleanOfficeForUrl(r.office);
    const pin = r.pincode;

    const dirPath = path.join(
      outDir,
      stateSlug,
      districtSlug,
      officeSlug,
      pin
    );

    fs.mkdirSync(dirPath, { recursive: true });

    fs.writeFileSync(
      path.join(dirPath, "index.html"),
      pageTemplate(r)
    );
  }
}

console.log("✅ SEO pages generated with clean post office URLs");
