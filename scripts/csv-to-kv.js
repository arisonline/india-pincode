const fs = require("fs");
const { parse } = require("csv-parse/sync");

const csvFile = "data/pincode.csv";
const outputFile = "kv-from-csv.json";

const csvData = fs.readFileSync(csvFile, "utf8");

const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true
});

const map = {};

for (const r of records) {
  const pin = String(r.pincode || "").trim();
  if (!pin) continue;

  if (!map[pin]) {
    map[pin] = {
      state: r.statename?.trim(),
      district: r.district?.trim(),
      offices: []
    };
  }

  // Push FULL office data (as-is)
  map[pin].offices.push({
    officename: r.officename?.trim(),
    officetype: r.officetype?.trim(),
    delivery: r.delivery?.trim(),
    divisionname: r.divisionname?.trim(),
    regionname: r.regionname?.trim(),
    circlename: r.circlename?.trim(),
    latitude: r.latitude,
    longitude: r.longitude
  });
}

fs.writeFileSync(outputFile, JSON.stringify(map, null, 2));
console.log("Created:", outputFile);
