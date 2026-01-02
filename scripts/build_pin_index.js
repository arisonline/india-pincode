import fs from "fs";
import path from "path";

const dataDir = "data";
const outFile = "output/pin_index.json";

const index = {};

function slug(t) {
  return t
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\b(b\.o|s\.o|h\.o|p\.o|bo|so|ho|po)\b/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

fs.mkdirSync("output", { recursive: true });

const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".json"));

for (const file of files) {
  const stateData = JSON.parse(
    fs.readFileSync(path.join(dataDir, file), "utf8")
  );

  for (const pin in stateData) {
    const entry = stateData[pin];
    const stateSlug = slug(entry.state);
    const district = entry.district;

    if (!index[stateSlug]) index[stateSlug] = {};
    if (!index[stateSlug][district]) index[stateSlug][district] = {};

    entry.offices.forEach(o => {
      const officeSlug = slug(o.officename);
      if (!index[stateSlug][district][officeSlug]) {
        index[stateSlug][district][officeSlug] = [];
      }
      if (!index[stateSlug][district][officeSlug].includes(pin)) {
        index[stateSlug][district][officeSlug].push(pin);
      }
    });
  }
}

fs.writeFileSync(outFile, JSON.stringify(index, null, 2));
console.log("PIN_INDEX generated successfully");
