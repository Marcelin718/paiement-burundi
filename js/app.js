/* =========================================================
   PayReg Burundi — app.js
   ========================================================= */

// -------------------- CONFIGURATION --------------------
const CONFIG = {
  // Numéro WhatsApp de l'assistance (format international, sans "+")
  WHATSAPP_NUMBER: "25765168879",
  // Endpoint backend PHP
  API_ENDPOINT: "php/api/save_payment.php",
  // Coordonnées pour la météo (Bujumbura, capitale économique du Burundi)
  WEATHER_LAT: -3.3822,
  WEATHER_LON: 29.3644,
};

// -------------------- MÉTÉO (Open-Meteo, sans clé API) --------------------
const WMO_CODES = {
  0: ["☀️", "Ciel dégagé"],
  1: ["🌤️", "Plutôt dégagé"],
  2: ["⛅", "Partiellement nuageux"],
  3: ["☁️", "Couvert"],
  45: ["🌫️", "Brouillard"],
  48: ["🌫️", "Brouillard givrant"],
  51: ["🌦️", "Bruine légère"],
  53: ["🌦️", "Bruine"],
  55: ["🌧️", "Bruine dense"],
  61: ["🌧️", "Pluie légère"],
  63: ["🌧️", "Pluie modérée"],
  65: ["🌧️", "Pluie forte"],
  80: ["🌦️", "Averses"],
  81: ["🌧️", "Fortes averses"],
  82: ["⛈️", "Averses violentes"],
  95: ["⛈️", "Orage"],
  96: ["⛈️", "Orage avec grêle"],
  99: ["⛈️", "Orage violent"],
};

async function loadWeather() {
  const body = document.getElementById("weatherBody");
  body.innerHTML = `<div class="weather-loading">Chargement de la météo…</div>`;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${CONFIG.WEATHER_LAT}` +
    `&longitude=${CONFIG.WEATHER_LON}&current=temperature_2m,relative_humidity_2m,` +
    `wind_speed_10m,weather_code&timezone=Africa%2FBujumbura`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Réponse météo invalide");
    const data = await res.json();
    const c = data.current;
    const [icon, desc] = WMO_CODES[c.weather_code] || ["🌡️", "Conditions inconnues"];

    body.innerHTML = `
      <div class="weather-main">
        <span class="weather-icon">${icon}</span>
        <div>
          <div class="weather-temp">${Math.round(c.temperature_2m)}°C</div>
          <div class="weather-desc">${desc}</div>
        </div>
      </div>
      <div class="weather-meta">
        <div>Humidité<b>${c.relative_humidity_2m}%</b></div>
        <div>Vent<b>${Math.round(c.wind_speed_10m)} km/h</b></div>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div class="weather-error">Météo indisponible pour le moment.</div>`;
  }
}

document.getElementById("weatherRefresh").addEventListener("click", (e) => {
  e.currentTarget.classList.add("spin");
  loadWeather().finally(() => {
    setTimeout(() => e.currentTarget.classList.remove("spin"), 700);
  });
});

loadWeather();

// -------------------- REÇU EN DIRECT --------------------
const form = document.getElementById("paymentForm");
const receiptEls = {
  id: document.getElementById("receiptId"),
  name: document.getElementById("receiptName"),
  phone: document.getElementById("receiptPhone"),
  method: document.getElementById("receiptMethod"),
  ref: document.getElementById("receiptRef"),
  date: document.getElementById("receiptDate"),
  currency: document.getElementById("receiptCurrency"),
  amount: document.getElementById("receiptAmount"),
};

function formatDate(d) {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function updateReceipt() {
  const fd = new FormData(form);
  receiptEls.name.textContent = fd.get("fullName")?.trim() || "—";
  receiptEls.phone.textContent = fd.get("phone")?.trim() || "—";
  receiptEls.method.textContent = fd.get("method") || "—";
  receiptEls.ref.textContent = fd.get("reference")?.trim() || "—";
  receiptEls.currency.textContent = fd.get("currency") || "BIF";
  const amount = parseFloat(fd.get("amount"));
  receiptEls.amount.textContent = isNaN(amount) ? "0.00" : amount.toFixed(2);
  receiptEls.date.textContent = formatDate(new Date());
}

form.addEventListener("input", updateReceipt);
form.addEventListener("change", updateReceipt);
updateReceipt();

// -------------------- LIEN WHATSAPP DYNAMIQUE --------------------
function buildWhatsappLink() {
  const fd = new FormData(form);
  const name = fd.get("fullName")?.trim();
  const amount = fd.get("amount");
  const currency = fd.get("currency") || "BIF";
  const ref = fd.get("reference")?.trim();

  let message = "Bonjour, je souhaite des informations sur un paiement.";
  if (name || amount || ref) {
    message = `Bonjour, je viens d'enregistrer un paiement`
      + (name ? ` au nom de ${name}` : "")
      + (amount ? ` d'un montant de ${amount} ${currency}` : "")
      + (ref ? ` (réf. ${ref})` : "")
      + `. Pouvez-vous me confirmer sa bonne réception ?`;
  }
  return `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function refreshWhatsappLinks() {
  const link = buildWhatsappLink();
  document.getElementById("whatsappBtn").href = link;
  document.getElementById("whatsappFloat").href = link;
}

form.addEventListener("input", refreshWhatsappLinks);
refreshWhatsappLinks();

// -------------------- VALIDATION --------------------
function setError(fieldName, message) {
  const el = document.querySelector(`.field-error[data-for="${fieldName}"]`);
  const input = form.elements[fieldName];
  if (el) el.textContent = message || "";
  if (input) input.classList.toggle("invalid", !!message);
}

function validateForm() {
  let valid = true;
  const fd = new FormData(form);

  const fullName = fd.get("fullName")?.trim();
  if (!fullName || fullName.length < 2) {
    setError("fullName", "Veuillez indiquer le nom complet.");
    valid = false;
  } else setError("fullName");

  const phone = fd.get("phone")?.trim();
  if (!phone || !/^[+0-9\s-]{7,20}$/.test(phone)) {
    setError("phone", "Numéro de téléphone invalide.");
    valid = false;
  } else setError("phone");

  const email = fd.get("email")?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("email", "Adresse e-mail invalide.");
    valid = false;
  } else setError("email");

  const reference = fd.get("reference")?.trim();
  if (!reference) {
    setError("reference", "La référence est requise.");
    valid = false;
  } else setError("reference");

  const amount = parseFloat(fd.get("amount"));
  if (isNaN(amount) || amount <= 0) {
    setError("amount", "Montant invalide.");
    valid = false;
  } else setError("amount");

  return valid;
}

// -------------------- SOUMISSION --------------------
const submitBtn = document.getElementById("submitBtn");
const statusEl = document.getElementById("formStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  statusEl.className = "form-status";

  if (!validateForm()) {
    statusEl.textContent = "Veuillez corriger les champs en rouge.";
    statusEl.classList.add("error");
    return;
  }

  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());

  submitBtn.disabled = true;
  submitBtn.querySelector("span").textContent = "Enregistrement…";

  try {
    const res = await fetch(CONFIG.API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok || !result.success) {
      throw new Error(result.message || "Le serveur a refusé l'enregistrement.");
    }

    receiptEls.id.textContent = "#" + String(result.id ?? "0000").padStart(6, "0");
    statusEl.textContent = "Paiement enregistré avec succès. Reçu confirmé.";
    statusEl.classList.add("success");
    form.reset();
    updateReceipt();
    refreshWhatsappLinks();
  } catch (err) {
    statusEl.textContent =
      "Impossible de contacter le serveur (" + err.message + "). " +
      "Vérifiez que le backend PHP et la base de données sont configurés.";
    statusEl.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector("span").textContent = "Enregistrer le paiement";
  }
});

