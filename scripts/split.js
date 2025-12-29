import fs from "fs";

const raw = fs.readFileSync("data/pincodes.json", "utf8");
const data = JSON.parse(raw);

const states = {};

data.forEach(row => {
  // Adjust these keys if your CSV uses different names
  const state =
    row.State ||
    row.state ||
    row.StateName ||
    row.STATE;

  if (!state) return;

  // Clean state name for filename
  const safeState = state
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");

  if (!states[safeState]) states[safeState] = [];
  states[safeState].push(row);
});

// Write state-wise JSON files
Object.keys(states).forEach(state => {
  fs.writeFileSync(
    `data/${state}.json`,
    JSON.stringify(states[state], null, 2)
  );
});

console.log("State-wise JSON created");
