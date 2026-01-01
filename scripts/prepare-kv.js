const fs = require("fs");
const path = require("path");

const DATA_DIR = "data";
const OUT_FILE = "kv-upload.json";

const result = {};

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));

for (const file of files) {
  const rows = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, file), "utf8")
  );

  for (const r of rows) {
    if (!r.pincode) continue;

    if (!result[r.pincode]) {
      result[r.pincode] = {
        state: r.state,
        district: r.district,
        offices: []
      };
    }

    result[r.pincode].offices.push({
      name: r.office.replace(/\b(BO|SO|HO)\b/g, "").trim(),
      type: r.officetype,
      circle: r.circle,
      region: r.region
    });
  }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(result));
console.log("KV data prepared");
