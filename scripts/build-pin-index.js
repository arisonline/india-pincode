const fs = require("fs");

const RAW_FILE = "states/tripura.json";
const OUT_FILE = "pin-index/tripura.json";

const raw = JSON.parse(fs.readFileSync(RAW_FILE, "utf8"));

const index = {
  state: "Tripura",
  districts: {}
};

function slug(text) {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/\b(b\.o|s\.o|h\.o|p\.o|bo|so|ho|po)\b/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

for (const pin in raw) {
  const record = raw[pin];
  const district = record.district;

  if (!index.districts[district]) {
    index.districts[district] = {};
  }

  record.offices.forEach(o => {
    const name = o.officename
      .replace(/\b(B\.O|S\.O|H\.O|P\.O)\b/gi, "")
      .trim();

    const alpha = name[0]?.toUpperCase() || "#";

    if (!index.districts[district][alpha]) {
      index.districts[district][alpha] = [];
    }

    index.districts[district][alpha].push({
      name,
      slug: slug(name),
      pin,
      lat: o.latitude && o.latitude !== "NA" ? o.latitude : null,
      lng: o.longitude && o.longitude !== "NA" ? o.longitude : null
    });
  });
}

fs.mkdirSync("pin-index", { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2));

console.log("✅ FULL PIN_INDEX generated:", OUT_FILE);
