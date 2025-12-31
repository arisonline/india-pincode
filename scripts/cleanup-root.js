const fs = require("fs");
const path = require("path");

const SAFE_DIRS = new Set([
  "site",
  "data",
  "scripts",
  ".github",
  "node_modules",
]);

const root = process.cwd();

const items = fs.readdirSync(root, { withFileTypes: true });

for (const item of items) {
  if (!item.isDirectory()) continue;

  const name = item.name;

  if (SAFE_DIRS.has(name)) continue;
  if (name.startsWith(".")) continue;

  // delete SEO-generated folders
  const looksGenerated =
    name === name.toLowerCase() &&
    (name.includes("-") || /\d/.test(name));

  if (looksGenerated) {
    fs.rmSync(path.join(root, name), {
      recursive: true,
      force: true,
    });
    console.log("Deleted:", name);
  }
}

// delete old root index.html
if (fs.existsSync("index.html")) {
  fs.rmSync("index.html", { force: true });
  console.log("Deleted root index.html");
}

console.log("Cleanup done");
