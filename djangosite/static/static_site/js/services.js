// ── SERVICES.JS ─────────────────────────────────
// Handles all service booking calculations and cart management

const CITIES = [
  "Agra","Ahmedabad","Amritsar","Aurangabad","Bangalore",
  "Bhopal","Chandigarh","Chennai","Coimbatore","Delhi",
  "Goa","Guwahati","Hyderabad","Indore","Jaipur",
  "Jodhpur","Kochi","Kolkata","Lucknow","Ludhiana",
  "Madurai","Mangaluru","Mumbai","Mysuru","Nagpur",
  "Nashik","Patna","Pune","Raipur","Ranchi",
  "Surat","Thiruvananthapuram","Udaipur","Vadodara","Varanasi",
  "Visakhapatnam","Shimla","Manali","Rishikesh","Darjeeling"
];

// ─── CART ───────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem('checkoutServices')) || [];
}

function saveCart(cart) {
  localStorage.setItem('checkoutServices', JSON.stringify(cart));
  renderSidebarCart();
  updateCartBadge();
}

function addToCart(item) {
  const cart = getCart();
  cart.push(item);
  saveCart(cart);
  // Redirect straight to the review & pay page
  window.location.href = 'wishlist.html';
}

function saveRecentCity(city) {
  if (!city || city.length < 2) return;
  let recent = JSON.parse(localStorage.getItem('recentCities') || '[]');
  recent = [city, ...recent.filter(c => c.toLowerCase() !== city.toLowerCase())].slice(0, 5);
  localStorage.setItem('recentCities', JSON.stringify(recent));
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function renderSidebarCart() {
  const cart = getCart();
  const list = document.getElementById('sidebar-cart-items');
  const totalEl = document.getElementById('sidebar-cart-total');
  const emptyEl = document.getElementById('sidebar-cart-empty');
  const checkoutBtn = document.getElementById('sidebar-checkout-btn');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    if (totalEl) totalEl.parentElement.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'none';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    if (totalEl) totalEl.parentElement.style.display = 'flex';
    if (checkoutBtn) checkoutBtn.style.display = 'flex';
    list.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</span>
        <button class="cart-item-remove" onclick="removeFromCart(${i})" title="Remove">×</button>
      </div>
    `).join('');
    const total = cart.reduce((s, i) => s + i.price, 0);
    totalEl.textContent = '₹' + total.toLocaleString('en-IN');
  }
}

function updateCartBadge() {
  const cart = getCart();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = cart.length;
    el.style.display = cart.length > 0 ? 'inline-flex' : 'none';
  });
}

// ─── FLIGHTS ────────────────────────────────────
let calculatedFlightPrice = 0;

function calculateFlight() {
  const from = document.getElementById('flightFrom').value.trim();
  const to   = document.getElementById('flightTo').value.trim();
  const date = document.getElementById('flightDate').value;

  if (!from || !to) { showToast('Please enter both origin and destination.', 'error'); return; }
  if (from.toLowerCase() === to.toLowerCase()) { showToast('Origin and destination cannot be the same.', 'error'); return; }

  const baseFare = 2800;
  const distanceFactor = Math.abs(from.length - to.length + 5) * 130 + (from.charCodeAt(0) + to.charCodeAt(0)) % 500;
  const dateBonus = date ? (new Date(date) - new Date() < 7 * 86400000 ? 800 : 0) : 0; // last-minute surcharge
  calculatedFlightPrice = Math.round(baseFare + distanceFactor + dateBonus);

  document.getElementById('flightPriceDisplay').textContent = '₹' + calculatedFlightPrice.toLocaleString('en-IN');
  document.getElementById('flightPriceResult').style.display = 'flex';
}

function addFlight() {
  if (!calculatedFlightPrice) { showToast('Please calculate flight price first.', 'error'); return; }
  const from = document.getElementById('flightFrom').value.trim();
  const to   = document.getElementById('flightTo').value.trim();
  const date = document.getElementById('flightDate').value;
  const dateStr = date ? new Date(date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) : '';

  saveRecentCity(from);
  saveRecentCity(to);
  addToCart({
    name: `Flight: ${from} → ${to}${dateStr ? ' ('+dateStr+')' : ''}`,
    price: calculatedFlightPrice
  });
  calculatedFlightPrice = 0;
  document.getElementById('flightPriceResult').style.display = 'none';
  document.getElementById('flightFrom').value = '';
  document.getElementById('flightTo').value = '';
  document.getElementById('flightDate').value = '';
}

// ─── TRAINS ─────────────────────────────────────
let calculatedTrainPrice = 0;

function calculateTrain() {
  const from  = document.getElementById('trainFrom').value.trim();
  const to    = document.getElementById('trainTo').value.trim();
  const cls   = document.getElementById('trainClass').value;

  if (!from || !to) { showToast('Please enter both stations.', 'error'); return; }

  const classMultipliers = { '1': 1, '2': 1.8, '3': 2.8, '4': 4.5 };
  const base = 400 + (from.length + to.length) * 35;
  calculatedTrainPrice = Math.round(base * (classMultipliers[cls] || 1));

  document.getElementById('trainPriceDisplay').textContent = '₹' + calculatedTrainPrice.toLocaleString('en-IN');
  document.getElementById('trainPriceResult').style.display = 'flex';
}

function addTrain() {
  if (!calculatedTrainPrice) { showToast('Please calculate train price first.', 'error'); return; }
  const from = document.getElementById('trainFrom').value.trim();
  const to   = document.getElementById('trainTo').value.trim();
  const cls  = document.getElementById('trainClass');
  const clsName = cls.options[cls.selectedIndex].text;

  saveRecentCity(from);
  saveRecentCity(to);
  addToCart({ name: `Train: ${from} → ${to} (${clsName})`, price: calculatedTrainPrice });
  calculatedTrainPrice = 0;
  document.getElementById('trainPriceResult').style.display = 'none';
  document.getElementById('trainFrom').value = '';
  document.getElementById('trainTo').value = '';
}

// ─── HOTELS ─────────────────────────────────────
let calculatedHotelPrice = 0;

function calculateHotel() {
  const city   = document.getElementById('hotelCity').value.trim();
  const checkin = document.getElementById('hotelCheckin').value; const checkout = document.getElementById('hotelCheckout').value; const nights = checkin && checkout ? Math.max(1, Math.round((new Date(checkout)-new Date(checkin))/(86400000))) : 1;
  const type   = document.getElementById('roomType').value;

  if (!city) { showToast('Please enter a city.', 'error'); return; }
  if (!nights || nights <= 0) { showToast('Please enter a valid number of nights.', 'error'); return; }

  const multipliers = { '1': 2000, '1.5': 3200, '2': 5500 };
  const perNight = multipliers[type] || 2000;
  calculatedHotelPrice = Math.round(perNight * nights);

  document.getElementById('hotelPriceDisplay').textContent = '₹' + calculatedHotelPrice.toLocaleString('en-IN');
  document.getElementById('hotelPriceResult').style.display = 'flex';
}

function addHotel() {
  if (!calculatedHotelPrice) { showToast('Please calculate hotel price first.', 'error'); return; }
  const city   = document.getElementById('hotelCity').value.trim();
  const checkinV = document.getElementById('hotelCheckin').value; const checkoutV = document.getElementById('hotelCheckout').value; const nights = checkinV && checkoutV ? Math.max(1, Math.round((new Date(checkoutV)-new Date(checkinV))/(86400000))) : 1;
  const type   = document.getElementById('roomType');
  const typeName = type.options[type.selectedIndex].text;

  saveRecentCity(city);
  addToCart({ name: `Hotel: ${typeName} in ${city} (${nights} nights)`, price: calculatedHotelPrice });
  calculatedHotelPrice = 0;
  document.getElementById('hotelPriceResult').style.display = 'none';
  document.getElementById('hotelCity').value = '';
  
}

// ─── AIRBNB ─────────────────────────────────────
let calculatedAirbnbPrice = 0;

function calculateAirbnb() {
  const city   = document.getElementById('airbnbCity').value.trim();
  const nights = parseInt(document.getElementById('airbnbNights').value);
  const guests = parseInt(document.getElementById('airbnbGuests').value) || 1;

  if (!city) { showToast('Please enter a city.', 'error'); return; }
  if (!nights || nights <= 0) { showToast('Enter valid nights.', 'error'); return; }

  const base = 1800 + (guests * 200);
  calculatedAirbnbPrice = Math.round(base * nights);

  document.getElementById('airbnbPriceDisplay').textContent = '₹' + calculatedAirbnbPrice.toLocaleString('en-IN');
  document.getElementById('airbnbPriceResult').style.display = 'flex';
}

function addAirbnb() {
  if (!calculatedAirbnbPrice) { showToast('Please calculate price first.', 'error'); return; }
  const city   = document.getElementById('airbnbCity').value.trim();
  const nights = document.getElementById('airbnbNights').value;

  saveRecentCity(city);
  addToCart({ name: `Airbnb: ${city} (${nights} nights)`, price: calculatedAirbnbPrice });
  calculatedAirbnbPrice = 0;
  document.getElementById('airbnbPriceResult').style.display = 'none';
  document.getElementById('airbnbCity').value = '';
  document.getElementById('airbnbNights').value = '';
}

// ─── VILLAS ─────────────────────────────────────
let calculatedVillaPrice = 0;

function calculateVilla() {
  const city   = document.getElementById('villaCity').value.trim();
  const nights = parseInt(document.getElementById('villaNights').value);
  const size   = document.getElementById('villaSize').value;

  if (!city || !nights || nights <= 0) { showToast('Please fill in all villa details.', 'error'); return; }

  const sizeRates = { 'small': 6000, 'medium': 10000, 'large': 18000 };
  calculatedVillaPrice = Math.round((sizeRates[size] || 6000) * nights);

  document.getElementById('villaPriceDisplay').textContent = '₹' + calculatedVillaPrice.toLocaleString('en-IN');
  document.getElementById('villaPriceResult').style.display = 'flex';
}

function addVilla() {
  if (!calculatedVillaPrice) { showToast('Please calculate price first.', 'error'); return; }
  const city   = document.getElementById('villaCity').value.trim();
  const nights = document.getElementById('villaNights').value;
  const size   = document.getElementById('villaSize');
  const sizeName = size.options[size.selectedIndex].text;

  saveRecentCity(city);
  addToCart({ name: `Villa: ${sizeName} in ${city} (${nights} nights)`, price: calculatedVillaPrice });
  calculatedVillaPrice = 0;
  document.getElementById('villaPriceResult').style.display = 'none';
  document.getElementById('villaCity').value = '';
  document.getElementById('villaNights').value = '';
}

// ─── CABS ───────────────────────────────────────
let calculatedCabPrice = 0;

function calculateCab() {
  const from  = document.getElementById('cabFrom').value.trim();
  const to    = document.getElementById('cabTo').value.trim();
  const type  = document.getElementById('cabType').value;

  if (!from || !to) { showToast('Please enter pickup and drop locations.', 'error'); return; }

  const rates = { 'mini': 12, 'sedan': 16, 'suv': 22, 'luxury': 35 };
  const estimatedKm = 20 + (from.length + to.length) * 5;
  calculatedCabPrice = Math.round(estimatedKm * (rates[type] || 16));

  document.getElementById('cabPriceDisplay').textContent = '₹' + calculatedCabPrice.toLocaleString('en-IN');
  document.getElementById('cabPriceResult').style.display = 'flex';
}

function addCab() {
  if (!calculatedCabPrice) { showToast('Please calculate cab price first.', 'error'); return; }
  const from = document.getElementById('cabFrom').value.trim();
  const to   = document.getElementById('cabTo').value.trim();
  const type = document.getElementById('cabType');
  const typeName = type.options[type.selectedIndex].text;

  saveRecentCity(from);
  saveRecentCity(to);
  addToCart({ name: `Cab (${typeName}): ${from} → ${to}`, price: calculatedCabPrice });
  calculatedCabPrice = 0;
  document.getElementById('cabPriceResult').style.display = 'none';
  document.getElementById('cabFrom').value = '';
  document.getElementById('cabTo').value = '';
}

// ─── CITY AUTOCOMPLETE ──────────────────────────
function showSuggestions(input) {
  const value = input.value.toLowerCase().trim();
  const box = input.parentElement.querySelector('.suggestions');
  box.innerHTML = '';
  if (!value || value.length < 1) return;

  const filtered = CITIES.filter(c => c.toLowerCase().startsWith(value));
  filtered.slice(0, 6).forEach(city => {
    const div = document.createElement('div');
    div.textContent = city;
    div.onclick = () => { input.value = city; box.innerHTML = ''; input.focus(); };
    box.appendChild(div);
  });
}

document.addEventListener('click', e => {
  if (!e.target.closest('.autocomplete-wrap')) {
    document.querySelectorAll('.suggestions').forEach(s => s.innerHTML = '');
  }
});

// ─── TOAST ──────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || '•'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ─── INIT ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebarCart();
  updateCartBadge();

  // Hash-based section scroll
  if (location.hash) {
    const el = document.querySelector(location.hash);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  }
});
