let stateMap = null;

async function loadStateMap() {
  if (!stateMap) {
    const res = await fetch("data/state-map.json");
    stateMap = await res.json();
  }
  return stateMap;
}

function normalizeStateFile(state) {
  return state
    .toLowerCase()
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("_");
}

async function searchPincode() {
  const pin = document.getElementById("pin").value.trim();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  if (!/^\d{6}$/.test(pin)) {
    resultDiv.innerHTML = "❌ Enter a valid 6-digit pincode";
    return;
  }

  const map = await loadStateMap();
  const prefix = pin.substring(0, 2);
  const rawState = map[prefix];

  let found = [];

  // 🔹 FAST PATH (state based)
  if (rawState) {
    const state = normalizeStateFile(rawState);

    try {
      const res = await fetch(`data/${state}.json`);
      if (res.ok) {
        const data = await res.json();
        found = data.filter(r => r.pincode === pin);
      }
    } catch {}
  }

  // 🔹 FALLBACK PATH (rare but accurate)
  if (!found.length) {
    const states = await fetch("data/state-map.json").then(r => r.json());
    const uniqueStates = [...new Set(Object.values(states))];

    for (const s of uniqueStates) {
      const file = normalizeStateFile(s);
      try {
        const res = await fetch(`data/${file}.json`);
        if (!res.ok) continue;
        const data = await res.json();
        const matches = data.filter(r => r.pincode === pin);
        if (matches.length) {
          found = matches;
          break;
        }
      } catch {}
    }
  }

  if (!found.length) {
    resultDiv.innerHTML = "❌ Pincode not found";
    return;
  }

  found.forEach(r => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ddd";
    div.style.padding = "8px";
    div.style.margin = "6px 0";

    div.innerHTML = `
      <b>${r.office}</b><br>
      District: ${r.district}<br>
      State: ${r.state}<br>
      Circle: ${r.circle}<br>
      Region: ${r.region}
    `;

    resultDiv.appendChild(div);
  });
}
