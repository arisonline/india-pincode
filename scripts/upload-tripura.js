const fs = require("fs");

const data = JSON.parse(
  fs.readFileSync("kv-tripura.json", "utf8")
);

const ACCOUNT = process.env.CF_ACCOUNT_ID;
const NS = process.env.CF_KV_NAMESPACE_ID;
const TOKEN = process.env.CF_API_TOKEN;

async function upload(key, value) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/storage/kv/namespaces/${NS}/values/${key}`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(value)
    }
  );

  if (!res.ok) {
    console.error("❌ Failed:", key);
  } else {
    console.log("✅ Uploaded:", key);
  }
}

(async () => {
  let count = 0;
  for (const pin of Object.keys(data)) {
    await upload(pin, data[pin]);
    count++;
    if (count % 50 === 0) {
      console.log("Uploaded", count);
      await new Promise(r => setTimeout(r, 200)); // rate limit
    }
  }
  console.log("🎉 Tripura upload complete");
})();
