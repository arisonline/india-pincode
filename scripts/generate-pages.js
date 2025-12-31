import fs from "fs";
import path from "path";

const dataDir = "data";
const outDir = "public";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\b(b\.?o\.?|s\.?o\.?|h\.?o\.?)\b/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function ensureIndex(dir, title, linksHtml) {
  const file = path.join(dir, "index.html");
  if (fs.existsSync(file)) return;

  fs.writeFileSync(
    file,
    `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <meta name="robots" content="index, follow">
</head>
<body>
<h1>${title}</h1>
<ul>
${linksHtml}
</ul>
</body>
</html>`
  );
}

const stateMap = {};

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
    const officeSlug = slugify(r.office);
    const pin = r.pincode;

    const pinDir = path.join(
      outDir,
      stateSlug,
      districtSlug,
      officeSlug,
      pin
    );

    fs.mkdirSync(pinDir, { recursive: true });

    // Pincode page
    fs.writeFileSync(
      path.join(pinDir, "index.html"),
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${r.office}, ${r.district}, ${r.state} – ${r.pincode}</title>
</head>
<body>
<h1>${r.office}</h1>
<p><b>Pincode:</b> ${r.pincode}</p>
<p><b>District:</b> ${r.district}</p>
<p><b>State:</b> ${r.state}</p>
</body>
</html>`
    );

    // Track structure
    stateMap[stateSlug] ??= {};
    stateMap[stateSlug][districtSlug] ??= new Set();
    stateMap[stateSlug][districtSlug].add(officeSlug);
  }
}

/* Create index pages */
for (const state in stateMap) {
  const stateDir = path.join(outDir, state);
  const districts = stateMap[state];

  let districtLinks = "";
  for (const district in districts) {
    districtLinks += `<li><a href="./${district}/">${district.replace(/-/g, " ")}</a></li>`;
  }

  ensureIndex(stateDir, `${state.replace(/-/g, " ")} Pincode List`, districtLinks);

  for (const district in districts) {
    const districtDir = path.join(stateDir, district);
    let officeLinks = "";

    for (const office of districts[district]) {
      officeLinks += `<li><a href="./${office}/">${office.replace(/-/g, " ")}</a></li>`;
    }

    ensureIndex(
      districtDir,
      `${district.replace(/-/g, " ")} Post Offices`,
      officeLinks
    );
  }
}

console.log("✅ All index pages generated");
