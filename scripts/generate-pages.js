import fs from "fs";
import path from "path";

const dataDir = "data";
const outDir = "public";

/* 🔥 CLEAN public folder (overwrite, no duplicates) */
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir);

/* ---------- HELPERS ---------- */

function cleanOfficeForUrl(name) {
  return name
    .toLowerCase()
    .replace(/\b(b\.?o\.?|s\.?o\.?|h\.?o\.?)\b/g, "")
    .replace(/\./g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/\./g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function writeIndex(dir, title, links) {
  const file = path.join(dir, "index.html");
  if (fs.existsSync(file)) return;

  fs.writeFileSync(
    file,
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="robots" content="index, follow">
</head>
<body>
<h1>${title}</h1>
<ul>
${links}
</ul>
</body>
</html>`
  );
}

/* ---------- MAIN LOGIC ---------- */

const tree = {}; // state -> district -> offices(set)

const files = fs.readdirSync(dataDir).filter(
  f => f.endsWith(".json") && !f.startsWith("state-map")
);

for (const file of files) {
  const records = JSON.parse(
    fs.readFileSync(path.join(dataDir, file), "utf8")
  );

  for (const r of records) {
    if (!r.pincode || !r.office || !r.state) continue;

    const state = slugify(r.state);
    const district = slugify(r.district || "unknown-district");
    const office = cleanOfficeForUrl(r.office);
    const pin = r.pincode;

    const pinDir = path.join(outDir, state, district, office, pin);
    fs.mkdirSync(pinDir, { recursive: true });

    /* Pincode page */
    fs.writeFileSync(
      path.join(pinDir, "index.html"),
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${r.office}, ${r.district}, ${r.state} – Pincode ${r.pincode}</title>
  <meta name="description" content="Pincode ${r.pincode} of ${r.office}, ${r.district}, ${r.state}. Official India Post details.">
</head>
<body>

<h1>${r.office}</h1>

<ul>
  <li><b>Pincode:</b> ${r.pincode}</li>
  <li><b>Post Office:</b> ${r.office}</li>
  <li><b>District:</b> ${r.district}</li>
  <li><b>State:</b> ${r.state}</li>
  <li><b>Circle:</b> ${r.circle}</li>
  <li><b>Region:</b> ${r.region}</li>
</ul>

<hr>
<p>Data Source: Department of Posts, Government of India (data.gov.in)</p>

</body>
</html>`
    );

    /* Track structure */
    tree[state] ??= {};
    tree[state][district] ??= new Set();
    tree[state][district].add(office);
  }
}

/* ---------- CREATE INDEX PAGES ---------- */

for (const state in tree) {
  const stateDir = path.join(outDir, state);
  let districtLinks = "";

  for (const district in tree[state]) {
    districtLinks += `<li><a href="./${district}/">${district.replace(/-/g, " ")}</a></li>`;
  }

  writeIndex(
    stateDir,
    `${state.replace(/-/g, " ")} Pincode Directory`,
    districtLinks
  );

  for (const district in tree[state]) {
    const districtDir = path.join(stateDir, district);
    let officeLinks = "";

    for (const office of tree[state][district]) {
      officeLinks += `<li><a href="./${office}/">${office.replace(/-/g, " ")}</a></li>`;
    }

    writeIndex(
      districtDir,
      `${district.replace(/-/g, " ")} Post Offices`,
      officeLinks
    );
  }
}

console.log("✅ All pages generated cleanly (public overwritten)");
