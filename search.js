async function searchPincode() {
  const pin = document.getElementById("pin").value.trim();
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = "";

  // basic validation
  if (!/^\d{6}$/.test(pin)) {
    resultDiv.innerHTML = "❌ Enter a valid 6-digit pincode";
    return;
  }

  // 🔹 We don't know the state yet
  // So we search ALL state files (one by one)
  const states = [
    "Assam",
    "Delhi",
    "West_Bengal",
    "Telangana",
    "Tamil_Nadu",
    "Uttar_Pradesh"
    // 👉 later we will auto-generate this list
  ];

  let found = [];

  for (const state of states) {
    try {
      const res = await fetch(`data/${state}.json`);
      if (!res.ok) continue;

      const data = await res.json();
      const matches = data.filter(r => r.pincode === pin);

      if (matches.length) {
        found = found.concat(matches);
      }
    } catch (e) {
      // ignore missing files
    }
  }

  if (!found.length) {
    resultDiv.innerHTML = "❌ Pincode not found";
    return;
  }

  // show results
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
