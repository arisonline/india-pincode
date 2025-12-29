import fs from "fs";

const csv = fs.readFileSync("data/pincode.csv", "utf8");

const lines = csv.split("\n");
const headers = lines[0].split(",");

const result = [];

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;

  const values = lines[i].split(",");
  const obj = {};

  headers.forEach((h, index) => {
    obj[h.trim()] = values[index]?.trim();
  });

  result.push(obj);
}

fs.writeFileSync(
  "data/pincodes.json",
  JSON.stringify(result, null, 2)
);

console.log("CSV converted to JSON");
