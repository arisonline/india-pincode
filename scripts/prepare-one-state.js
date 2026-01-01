const fs = require("fs");

// CHANGE THIS STATE FILE NAME WHEN NEEDED
const STATE_FILE = "data/Tripura.json";

const raw = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));

const grouped = {};

for (const row of raw) {
  const pin = row.pincode;

  if (!grouped[pin]) {
    grouped[pin] = {
      state: row.state,
      district: row.district,
      offices: []
    };
  }

  grouped[pin].offices.push({
    name: row.office.replace(/\b(BO|SO|HO)\b/g, "").trim(),
    type: row.office.split(" ").pop().replace(".", "")
  });
}

fs.writeFileSync(
  "kv-tripura.json",
  JSON.stringify(grouped, null, 2)
);

console.log("Tripura KV file created");
