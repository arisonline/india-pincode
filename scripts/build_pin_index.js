const fs = require("fs");
const path = require("path");

const STATE = "tripura";
const INPUT = `states/${STATE}.json`;
const OUTPUT_DIR = "pin-index";
const OUTPUT = `${OUTPUT_DIR}/${STATE}.json`;

function slug(text) {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\b(b\.o|s\.o|h\.o|p\.o|bo|so|ho|po)\b/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));

const index = {};

for (const pincode of Object.keys(raw)) {
  const entry = raw[pincode];
  const district = entry.district;

  if (!index[district]) index[district] = {};

  entry.offices.forEach(o => {
    const officeSlug = slug(o.officename);
    if (!index[district][officeSlug]) {
      index[district][officeSlug] = [];
    }
    index[district][officeSlug].push(pincode);
  });
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(index, null, 2));

console.log("PIN_INDEX generated:", OUTPUT);
