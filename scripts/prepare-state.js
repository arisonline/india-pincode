const fs = require("fs");
const path = require("path");

const dataDir = "data";

const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".json"));

if (files.length === 0) {
  console.log("No JSON files found in data/");
  process.exit(0);
}

for (const file of files) {
  const stateSlug = file
    .replace(".json", "")
    .toLowerCase()
    .replace(/_/g, "-");

  const raw = JSON.parse(
    fs.readFileSync(path.join(dataDir, file), "utf8")
  );

  const map = {};

  for (const r of raw) {
    const pin = r.pincode;
    if (!pin) continue;

    if (!map[pin]) {
      map[pin] = {
        state: r.state,
        district: r.district,
        offices: []
      };
    }

    const officeName = r.office.trim();
    const typeMatch = officeName.match(/\b(b\.o|s\.o|h\.o|bo|so|ho)\b/i);

    map[pin].offices.push({
      name: officeName,
      type: typeMatch ? typeMatch[0].replace(/\./g, "").toUpperCase() : ""
    });
  }

  const outFile = `kv-${stateSlug}.json`;
  fs.writeFileSync(outFile, JSON.stringify(map, null, 2));

  console.log("Created:", outFile);
}

console.log("All states processed");
