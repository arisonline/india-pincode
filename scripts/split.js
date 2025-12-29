import fs from "fs";

const data = JSON.parse(
  fs.readFileSync("data/pincodes.json", "utf8")
);

// Convert "WEST BENGAL" → "West_Bengal"
function toTitleCaseState(state) {
  return state
    .toLowerCase()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("_");
}

const states = {};

for (const row of data) {
  const rawState = row.state || row.statename;
  if (!rawState) continue;

  const stateFile = toTitleCaseState(rawState.trim());

  if (!states[stateFile]) states[stateFile] = [];
  states[stateFile].push(row);
}

// Write state-wise files
for (const state in states) {
  fs.writeFileSync(
    `data/${state}.json`,
    JSON.stringify(states[state])
  );
}

// Remove large master file
fs.unlinkSync("data/pincodes.json");

console.log("State-wise JSON created (Title Case)");
