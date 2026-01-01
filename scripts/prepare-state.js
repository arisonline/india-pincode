const fs = require("fs");

const STATE = process.argv[2]; // example: West_Bengal
if (!STATE) {
  console.error("State name required");
  process.exit(1);
}

const inputFile = `data/${STATE}.json`;
const outputFile = `kv-${STATE.toLowerCase().replace(/_/g, "-")}.json`;

const raw = JSON.parse(fs.readFileSync(inputFile, "utf8"));

const map = {};

for (const r of raw) {
  if (!r.pincode || !r.office) continue;

  const pin = String(r.pincode);

  if (!map[pin]) {
    map[pin] = {
      state: r.state,
      district: r.district,
      offices: []
    };
  }

  const officeName = r.office.trim();
  const typeMatch = officeName.match(/\b(B\.O|S\.O|H\.O|BO|SO|HO)\b/i);

  map[pin].offices.push({
    name: officeName,
    type: typeMatch ? typeMatch[0].replace(/\./g, "").toUpperCase() : ""
  });
}

fs.writeFileSync(outputFile, JSON.stringify(map, null, 2));
console.log("Created:", outputFile);
