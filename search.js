let stateMap = null;

async function loadStateMap() {
  if (!stateMap) {
    const res = await fetch("data/state-map.json");
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
  const prefix = pin.substring(0, 2);
  const state = map[prefix];

  if (!state) {
    resultDiv.innerHTML = "❌ State not found for this pincode";
    return;
  }

  try {
    const res = await fetch(`data/${state}.json`);
    if (!res.ok) throw new Error("State file missing");

    const data = await res.json();
    const matches = data.filter(r => r.pincode === pin);

    if (!matches.length) {
      resultDiv.innerHTML = "❌ Pincode not found";
      return;
    }

    matches.forEach(r => {
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

  } catch (e) {
    resultDiv.innerHTML = "❌ Data not available";
  }
}
