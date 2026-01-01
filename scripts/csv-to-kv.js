const fs = require("fs");
const { parse } = require("csv-parse/sync");

const csvFile = "data/pincode.csv";
const outputFile = "kv-from-csv.json";

// Read CSV
const csvData = fs.readFileSync(csvFile, "utf8");

// Parse CSV
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true
});

const map = {};

// Group by pincode
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

  map[pin].offices.push({
    name: r.officename?.trim(),
    type: r.officetype?.trim()
  });
}

// Save JSON
fs.writeFileSync(outputFile, JSON.stringify(map, null, 2));
console.log("Created:", outputFile);
