const fs = require("fs");

const STATE = process.argv[2]; // example: tripura
if (!STATE) {
  console.error("State name required");
  process.exit(1);
}

const inputFile = `data/${STATE}.json`;
const outputFile = `kv-${STATE}.json`;

const raw = JSON.parse(fs.readFileSync(inputFile, "utf8"));

const map = {};

for (const r of raw) {
  const pin = r.pincode;
  if (!map[pin]) {
    map[pin] = {
      state: r.state,
      district: r.district,
      offices: []
    };
  }

  map[pin].offices.push({
    name: r.office,
    type: r.office.split(" ").pop().replace(".", "")
  });
}

fs.writeFileSync(outputFile, JSON.stringify(map, null, 2));
console.log("Prepared:", outputFile);
