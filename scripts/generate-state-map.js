import fs from "fs";
import path from "path";

const dataDir = "data";
const files = fs.readdirSync(dataDir);

// state map: 3-digit -> state
const stateMap = {};

for (const file of files) {
  if (!file.endsWith(".json")) continue;
  if (file.startsWith("state-map")) continue;

  const stateName = file.replace(".json", "");
  const records = JSON.parse(
    fs.readFileSync(path.join(dataDir, file), "utf8")
  );

  for (const r of records) {
    if (!r.pincode) continue;

    const prefix3 = r.pincode.substring(0, 3);

    // if already mapped, skip (first valid wins)
    if (!stateMap[prefix3]) {
      stateMap[prefix3] = stateName;
    }
  }
}

fs.writeFileSync(
  "data/state-map-3digit.json",
  JSON.stringify(stateMap)
);

console.log("3-digit state map generated");
