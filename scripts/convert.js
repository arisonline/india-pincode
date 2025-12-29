import fs from "fs";

const csv = fs.readFileSync("data/pincode.csv", "utf8");
const lines = csv.split("\n");
const headers = lines[0].split(",");

const clean = (v) =>
  v
    ?.trim()
    .replace(/^"+|"+$/g, ""); // remove extra quotes

const result = [];

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;

  const values = lines[i].split(",");

  const row = {};
  headers.forEach((h, idx) => {
    row[h.trim()] = clean(values[idx]);
  });

  // 🔽 KEEP ONLY WHAT YOU NEED
  result.push({
    pincode: row.pincode,
    office: row.officename,
    district: row.district,
    state: row.statename,
    circle: row.circlename,
    region: row.regionname
  });
}

// 🔽 MINIFIED JSON (NO SPACES)
fs.writeFileSync(
  "data/pincodes.json",
  JSON.stringify(result)
);

console.log("CSV cleaned & converted to JSON");
