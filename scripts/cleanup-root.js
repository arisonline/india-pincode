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

  // never delete safe folders
  if (SAFE_DIRS.has(name)) continue;
  if (name.startsWith(".")) continue;

  // delete only SEO-generated folders
  const looksGenerated =
    name === name.toLowerCase() &&
    (name.includes("-") || /\d/.test(name));

  if (looksGenerated) {
    fs.rmSync(path.join(root, name), {
      recursive: true,
      force: true,
    });
    console.log(`🧹 Deleted root folder: ${name}`);
  }
}

// delete old root index.html
const rootIndex = path.join(root, "index.html");
if (fs.existsSync(rootIndex)) {
  fs.rmSync(rootIndex, { force: true });
  console.log("🧹 Deleted root index.html");
}

console.log("✅ Root cleanup completed");
