let stateMap = null;

async function loadStateMap() {
  if (!stateMap) {
    const res = await fetch("data/state-map-3digit.json");
    stateMap = await res.json();
  }
  return stateMap;
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
  const prefix3 = pin.substring(0, 3);
  const state = map[prefix3];

  let found = [];

  // FAST PATH (accurate)
  if (state) {
    try {
      const res = await fetch(`data/${state}.json`);
      if (res.ok) {
        const data = await res.json();
        found = data.filter(r => r.pincode === pin);
      }
    } catch {}
  }

  // SAFETY FALLBACK (rare, but 100%)
  if (!found.length) {
    for (const s of Object.values(map)) {
      try {
        const res = await fetch(`data/${s}.json`);
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
