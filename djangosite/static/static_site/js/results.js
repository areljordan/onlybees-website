// ══════════════════════════════════════════════════
//  OnlyBees — Search Results Engine
//  Generates realistic options for every service
// ══════════════════════════════════════════════════

// ── Utility ──────────────────────────────────────
function fmt(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function rand(min, max) { return min + Math.random() * (max - min); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function showResults(panelId, html) {
  const panel = document.getElementById(panelId);
  let box = panel.querySelector('.results-box');
  if (!box) {
    box = document.createElement('div');
    box.className = 'results-box';
    // Insert before the search button
    const btn = panel.querySelector('.search-btn-wrap');
    panel.insertBefore(box, btn);
  }
  box.innerHTML = html;
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function bookNow(name, price) {
  const cart = JSON.parse(localStorage.getItem('checkoutServices') || '[]');
  cart.push({ name, price: parseInt(price) });
  localStorage.setItem('checkoutServices', JSON.stringify(cart));
  window.location.href = 'wishlist.html';
}

// ── FLIGHTS ──────────────────────────────────────
const AIRLINES = [
  { name: 'IndiGo',         code: '6E', logo: '🔵', color: '#0066cc' },
  { name: 'Air India',      code: 'AI', logo: '🔴', color: '#c8102e' },
  { name: 'SpiceJet',       code: 'SG', logo: '🟠', color: '#e2231a' },
  { name: 'Vistara',        code: 'UK', logo: '🟣', color: '#663399' },
  { name: 'Go First',       code: 'G8', logo: '🟢', color: '#007932' },
  { name: 'Akasa Air',      code: 'QP', logo: '🟡', color: '#ff6b35' },
];
const FLIGHT_CLASSES = { economy: 1, premium: 1.8, business: 3.2, first: 5 };

function calculateFlight() {
  const from = document.getElementById('flightFrom').value.trim();
  const to   = document.getElementById('flightTo').value.trim();
  const date = document.getElementById('flightDate').value;
  const pax  = parseInt(document.getElementById('flightPassengers').value) || 1;
  const cls  = document.getElementById('flightClass').value;
  if (!from || !to) { showToast('Please enter both cities.', 'error'); return; }
  if (!date) { showToast('Please select a departure date.', 'error'); return; }

  const base = rand(2800, 8500);
  const mult = FLIGHT_CLASSES[cls] || 1;
  const dist = rand(0.8, 1.5);

  const options = AIRLINES.map((a, i) => {
    const price = Math.round(base * mult * dist * rand(0.85, 1.25) / 50) * 50;
    const dep = `${String(5 + i * 3).padStart(2,'0')}:${pick(['00','15','30','45'])}`;
    const dur = Math.floor(rand(1.5, 4));
    const durM = pick([0, 10, 25, 40, 55]);
    const arr = `${String((5 + i * 3 + dur) % 24).padStart(2,'0')}:${String(durM).padStart(2,'0')}`;
    const stops = price < 4000 ? pick([0, 1]) : 0;
    return { ...a, price, dep, arr, dur: `${dur}h ${durM}m`, stops, pax };
  }).sort((a, b) => a.price - b.price);

  const html = `
    <div class="results-header">
      <div class="results-title">${options.length} flights found · <span>${from} → ${to}</span></div>
      <div class="results-sort">
        <button class="sort-btn active" onclick="sortResults(this,'price')">Cheapest</button>
        <button class="sort-btn" onclick="sortResults(this,'dur')">Fastest</button>
      </div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.price}">
      <div class="rc-airline">
        <div class="rc-airline-logo">${o.logo}</div>
        <div>
          <div class="rc-airline-name">${o.name}</div>
          <div class="rc-airline-code">${o.code} ${Math.floor(rand(100,900))}</div>
        </div>
      </div>
      <div class="rc-route">
        <div class="rc-time">${o.dep}</div>
        <div class="rc-line">
          <div class="rc-line-inner"></div>
          <div class="rc-stops-label">${o.stops === 0 ? 'Non-stop' : `${o.stops} stop`}</div>
        </div>
        <div class="rc-time">${o.arr}</div>
      </div>
      <div class="rc-dur">${o.dur}</div>
      <div class="rc-price-wrap">
        <div class="rc-price">${fmt(o.price)}</div>
        <div class="rc-per">per person${o.pax > 1 ? ` · ${fmt(o.price * o.pax)} total` : ''}</div>
        <button class="rc-book-btn" onclick="bookNow('Flight: ${from} → ${to} (${o.name})', ${o.price * o.pax})">Book Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-flights', html);
}

// ── HOTELS ───────────────────────────────────────
const HOTEL_CHAINS = [
  { name: 'Taj Hotels',        stars: 5, logo: '⭐' },
  { name: 'Marriott',          stars: 5, logo: '⭐' },
  { name: 'ITC Hotels',        stars: 5, logo: '⭐' },
  { name: 'Hyatt',             stars: 4, logo: '✦'  },
  { name: 'Lemon Tree',        stars: 4, logo: '✦'  },
  { name: 'OYO Premium',       stars: 3, logo: '◆'  },
  { name: 'FabHotel',          stars: 3, logo: '◆'  },
];
const HOTEL_AMENITIES = ['Free WiFi','Pool','Spa','Restaurant','Gym','Airport Shuttle','Bar','Room Service'];

function calculateHotel() {
  const city = document.getElementById('hotelCity').value.trim();
  const checkin  = document.getElementById('hotelCheckin').value;
  const checkout = document.getElementById('hotelCheckout').value;
  const type = parseFloat(document.getElementById('roomType').value);
  if (!city) { showToast('Please enter a city.', 'error'); return; }
  if (!checkin || !checkout) { showToast('Please select check-in and check-out dates.', 'error'); return; }
  const nights = Math.max(1, Math.round((new Date(checkout) - new Date(checkin)) / 86400000));

  const options = HOTEL_CHAINS.map(h => {
    const base = h.stars >= 5 ? rand(6000,14000) : h.stars === 4 ? rand(3000,6000) : rand(900,2800);
    const pricePerNight = Math.round(base * type / 100) * 100;
    const total = pricePerNight * nights;
    const rating = (3.5 + Math.random() * 1.4).toFixed(1);
    const reviews = Math.floor(rand(80, 2400));
    const amenities = HOTEL_AMENITIES.sort(() => 0.5 - Math.random()).slice(0, pick([3,4,5]));
    return { ...h, pricePerNight, total, nights, rating, reviews, amenities };
  }).sort((a, b) => a.pricePerNight - b.pricePerNight);

  const html = `
    <div class="results-header">
      <div class="results-title">${options.length} hotels in <span>${city}</span> · ${nights} night${nights > 1 ? 's' : ''}</div>
      <div class="results-sort">
        <button class="sort-btn active" onclick="sortResults(this,'price')">Price ↑</button>
        <button class="sort-btn" onclick="sortResults(this,'rating')">Top Rated</button>
      </div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.pricePerNight}" data-rating="${o.rating}">
      <div class="rc-hotel-info">
        <div class="rc-hotel-stars">${'★'.repeat(o.stars)}${'☆'.repeat(5 - o.stars)}</div>
        <div class="rc-airline-name">${o.name} — ${city}</div>
        <div class="rc-amenities">${o.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}</div>
      </div>
      <div class="rc-rating-wrap">
        <div class="rc-rating">${o.rating}</div>
        <div class="rc-reviews">${o.reviews} reviews</div>
      </div>
      <div class="rc-price-wrap">
        <div class="rc-price">${fmt(o.pricePerNight)}</div>
        <div class="rc-per">per night · ${fmt(o.total)} total</div>
        <button class="rc-book-btn" onclick="bookNow('Hotel: ${o.name}, ${city} (${nights}N)', ${o.total})">Book Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-hotels', html);
}

// ── TRAINS ───────────────────────────────────────
const TRAINS_LIST = [
  { name: 'Rajdhani Express',   type: 'Superfast', num: '12301' },
  { name: 'Shatabdi Express',   type: 'Superfast', num: '12002' },
  { name: 'Vande Bharat',       type: 'Premium',   num: '22439' },
  { name: 'Duronto Express',    type: 'Superfast', num: '12213' },
  { name: 'Garib Rath',         type: 'Express',   num: '12203' },
  { name: 'Jan Shatabdi',       type: 'Express',   num: '12051' },
];
const TRAIN_CLASS_MULT = { '1': 1, '2': 1.8, '3': 2.5, '4': 3.8 };
const TRAIN_CLASS_NAME = { '1': 'SL', '2': '3A', '3': '2A', '4': '1A' };

function calculateTrain() {
  const from = document.getElementById('trainFrom').value.trim();
  const to   = document.getElementById('trainTo').value.trim();
  const date = document.getElementById('trainDate').value;
  const cls  = document.getElementById('trainClass').value;
  if (!from || !to) { showToast('Please enter both cities.', 'error'); return; }
  if (!date) { showToast('Please select a travel date.', 'error'); return; }

  const clsName = TRAIN_CLASS_NAME[cls];
  const clsMult = TRAIN_CLASS_MULT[cls] || 1;

  const options = TRAINS_LIST.map(t => {
    const base = rand(350, 900);
    const price = Math.round(base * clsMult / 10) * 10;
    const dep = `${String(Math.floor(rand(4,22))).padStart(2,'0')}:${pick(['00','15','30','45'])}`;
    const dur = `${Math.floor(rand(4,18))}h ${pick([0,10,20,30,40,50])}m`;
    const avail = pick(['Available','Waiting List','RAC']);
    return { ...t, price, dep, dur, avail, cls: clsName };
  }).sort((a, b) => a.price - b.price);

  const html = `
    <div class="results-header">
      <div class="results-title">${options.length} trains · <span>${from} → ${to}</span> · ${clsName}</div>
      <div class="results-sort">
        <button class="sort-btn active" onclick="sortResults(this,'price')">Cheapest</button>
        <button class="sort-btn" onclick="sortResults(this,'dep')">Departure</button>
      </div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.price}">
      <div class="rc-airline">
        <div class="rc-train-num">${o.num}</div>
        <div>
          <div class="rc-airline-name">${o.name}</div>
          <div class="rc-airline-code">${o.type} · ${o.cls}</div>
        </div>
      </div>
      <div class="rc-route">
        <div class="rc-time">${o.dep}</div>
        <div class="rc-line"><div class="rc-line-inner"></div><div class="rc-stops-label">${o.dur}</div></div>
        <div class="rc-avail ${o.avail === 'Available' ? 'avail-yes' : 'avail-wait'}">${o.avail}</div>
      </div>
      <div class="rc-price-wrap">
        <div class="rc-price">${fmt(o.price)}</div>
        <div class="rc-per">per person</div>
        <button class="rc-book-btn" onclick="bookNow('Train: ${from} → ${to} (${o.name})', ${o.price})">Book Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-trains', html);
}

// ── BUSES ────────────────────────────────────────
const BUS_OPERATORS = [
  { name: 'RedBus',        rating: 4.5 },
  { name: 'SRS Travels',   rating: 4.2 },
  { name: 'KSRTC',         rating: 3.9 },
  { name: 'VRL Travels',   rating: 4.3 },
  { name: 'Orange Tours',  rating: 4.1 },
  { name: 'Parveen Travels', rating: 4.0 },
];
const BUS_TYPE_MULT = { '1': 1, '1.5': 1.4, '2': 1.9, '2.5': 2.4, '3': 3 };
const BUS_TYPE_NAME = { '1': 'Non-AC Seater', '1.5': 'AC Seater', '2': 'AC Sleeper', '2.5': 'Volvo AC', '3': 'Volvo Multi-Axle' };

function calculateBus() {
  const from = document.getElementById('busFrom').value.trim();
  const to   = document.getElementById('busTo').value.trim();
  const date = document.getElementById('busDate').value;
  const type = document.getElementById('busType').value;
  const pax  = parseInt(document.getElementById('busPassengers').value) || 1;
  if (!from || !to) { showToast('Please enter both cities.', 'error'); return; }
  if (!date) { showToast('Please select a travel date.', 'error'); return; }

  const typeMult = BUS_TYPE_MULT[type] || 1;
  const typeName = BUS_TYPE_NAME[type];

  const options = BUS_OPERATORS.map(b => {
    const base = rand(300, 700);
    const price = Math.round(base * typeMult / 10) * 10;
    const dep = `${String(Math.floor(rand(18,23))).padStart(2,'0')}:${pick(['00','30'])}`;
    const dur = `${Math.floor(rand(5,14))}h`;
    const seats = Math.floor(rand(2, 25));
    return { ...b, price, dep, dur, seats, typeName, pax };
  }).sort((a, b) => a.price - b.price);

  const html = `
    <div class="results-header">
      <div class="results-title">${options.length} buses · <span>${from} → ${to}</span></div>
      <div class="results-sort">
        <button class="sort-btn active" onclick="sortResults(this,'price')">Cheapest</button>
        <button class="sort-btn" onclick="sortResults(this,'rating')">Top Rated</button>
      </div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.price}" data-rating="${o.rating}">
      <div class="rc-airline">
        <div class="rc-bus-icon">🚌</div>
        <div>
          <div class="rc-airline-name">${o.name}</div>
          <div class="rc-airline-code">${o.typeName} · ${'★'.repeat(Math.round(o.rating))}</div>
        </div>
      </div>
      <div class="rc-route">
        <div class="rc-time">${o.dep}</div>
        <div class="rc-line"><div class="rc-line-inner"></div><div class="rc-stops-label">${o.dur}</div></div>
        <div class="rc-avail avail-yes">${o.seats} seats left</div>
      </div>
      <div class="rc-price-wrap">
        <div class="rc-price">${fmt(o.price)}</div>
        <div class="rc-per">per person${o.pax > 1 ? ` · ${fmt(o.price * o.pax)} total` : ''}</div>
        <button class="rc-book-btn" onclick="bookNow('Bus: ${from} → ${to} (${o.name})', ${o.price * o.pax})">Book Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-buses', html);
}

// ── CABS ─────────────────────────────────────────
const CAB_PROVIDERS = [
  { name: 'Ola',        type: 'App-based',  logo: '🟢' },
  { name: 'Uber',       type: 'App-based',  logo: '⬛' },
  { name: 'Meru Cabs',  type: 'Radio Cab',  logo: '🔵' },
  { name: 'InDrive',    type: 'App-based',  logo: '🟡' },
  { name: 'Rapido',     type: 'Bike/Cab',   logo: '🟠' },
];
const CAB_TYPE_BASE = { mini: 900, sedan: 1400, suv: 2200, luxury: 4500 };

function calculateCab() {
  const from = document.getElementById('cabFrom').value.trim();
  const to   = document.getElementById('cabTo').value.trim();
  const type = document.getElementById('cabType').value;
  if (!from || !to) { showToast('Please enter pickup and drop locations.', 'error'); return; }

  const base = CAB_TYPE_BASE[type] || 1200;

  const options = CAB_PROVIDERS.map(c => {
    const price = Math.round(base * rand(0.85, 1.3) / 10) * 10;
    const eta = Math.floor(rand(3, 18));
    const dur = `${Math.floor(rand(20, 90))} mins`;
    const rating = (3.8 + Math.random() * 1.1).toFixed(1);
    return { ...c, price, eta, dur, rating };
  }).sort((a, b) => a.price - b.price);

  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  const html = `
    <div class="results-header">
      <div class="results-title">${options.length} ${typeLabel} cabs available · <span>${from} → ${to}</span></div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.price}">
      <div class="rc-airline">
        <div class="rc-airline-logo">${o.logo}</div>
        <div>
          <div class="rc-airline-name">${o.name} ${typeLabel}</div>
          <div class="rc-airline-code">${o.type} · ★ ${o.rating}</div>
        </div>
      </div>
      <div class="rc-route">
        <div class="rc-time" style="font-size:0.85rem">ETA ${o.eta} min</div>
        <div class="rc-line"><div class="rc-line-inner"></div><div class="rc-stops-label">${o.dur}</div></div>
        <div class="rc-avail avail-yes">Available</div>
      </div>
      <div class="rc-price-wrap">
        <div class="rc-price">${fmt(o.price)}</div>
        <div class="rc-per">estimated fare</div>
        <button class="rc-book-btn" onclick="bookNow('Cab: ${from} → ${to} (${o.name})', ${o.price})">Book Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-cabs', html);
}

// ── AIRBNB ───────────────────────────────────────
const AIRBNB_TYPES = ['Entire Apartment','Private Room','Entire Villa','Cosy Studio','Heritage Home','Beach Cottage'];
const AIRBNB_HOSTS = ['Priya','Rahul','Meera','Arjun','Sunita','Vikram'];

function calculateAirbnb() {
  const city   = document.getElementById('airbnbCity').value.trim();
  const nights = parseInt(document.getElementById('airbnbNights').value) || 1;
  const guests = parseInt(document.getElementById('airbnbGuests').value) || 1;
  if (!city) { showToast('Please enter a city.', 'error'); return; }

  const options = Array.from({length: 6}, (_, i) => {
    const pricePerNight = Math.round(rand(1200, 8000) / 100) * 100;
    const total = pricePerNight * nights;
    const rating = (4.0 + Math.random() * 0.95).toFixed(2);
    const reviews = Math.floor(rand(10, 320));
    const type = AIRBNB_TYPES[i];
    const host = AIRBNB_HOSTS[i];
    const beds = Math.floor(rand(1, 4));
    return { type, host, pricePerNight, total, rating, reviews, beds, guests };
  }).sort((a, b) => a.pricePerNight - b.pricePerNight);

  const html = `
    <div class="results-header">
      <div class="results-title">${options.length} Airbnbs in <span>${city}</span> · ${nights} night${nights>1?'s':''} · ${guests} guest${guests>1?'s':''}</div>
      <div class="results-sort">
        <button class="sort-btn active" onclick="sortResults(this,'price')">Price ↑</button>
        <button class="sort-btn" onclick="sortResults(this,'rating')">Top Rated</button>
      </div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.pricePerNight}" data-rating="${o.rating}">
      <div class="rc-hotel-info">
        <div class="rc-airline-name">${o.type} · ${city}</div>
        <div class="rc-airline-code">Host: ${o.host} · ${o.beds} bed${o.beds>1?'s':''} · Up to ${o.guests} guests</div>
        <div class="rc-amenities">
          <span class="amenity-tag">Self check-in</span>
          <span class="amenity-tag">Free WiFi</span>
          <span class="amenity-tag">Kitchen</span>
        </div>
      </div>
      <div class="rc-rating-wrap">
        <div class="rc-rating">${o.rating}</div>
        <div class="rc-reviews">${o.reviews} reviews</div>
      </div>
      <div class="rc-price-wrap">
        <div class="rc-price">${fmt(o.pricePerNight)}</div>
        <div class="rc-per">per night · ${fmt(o.total)} total</div>
        <button class="rc-book-btn" onclick="bookNow('Airbnb: ${o.type}, ${city} (${nights}N)', ${o.total})">Book Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-airbnb', html);
}

// ── VILLAS ───────────────────────────────────────
const VILLA_NAMES = ['Palm Breeze Villa','The Heritage Retreat','Azure Poolside Villa','Forest Edge Estate','Sunrise Cliff Villa','Royal Garden House'];
const VILLA_SIZE_MULT = { small: 1, medium: 1.6, large: 2.8 };
const VILLA_SIZE_LABEL = { small: '2–4 guests', medium: '5–8 guests', large: '9–16 guests' };

function calculateVilla() {
  const city   = document.getElementById('villaCity').value.trim();
  const nights = parseInt(document.getElementById('villaNights').value) || 1;
  const size   = document.getElementById('villaSize').value;
  if (!city) { showToast('Please enter a destination.', 'error'); return; }

  const mult = VILLA_SIZE_MULT[size] || 1;
  const sizeLabel = VILLA_SIZE_LABEL[size];

  const options = VILLA_NAMES.map(name => {
    const pricePerNight = Math.round(rand(5000, 18000) * mult / 100) * 100;
    const total = pricePerNight * nights;
    const rating = (4.2 + Math.random() * 0.75).toFixed(1);
    const reviews = Math.floor(rand(8, 120));
    const beds = size === 'large' ? Math.floor(rand(4,8)) : size === 'medium' ? Math.floor(rand(3,5)) : Math.floor(rand(1,3));
    const amenities = ['Private Pool','AC Rooms','Kitchen','Caretaker'].sort(() => 0.5 - Math.random()).slice(0,3);
    return { name, pricePerNight, total, rating, reviews, beds, amenities, sizeLabel };
  }).sort((a, b) => a.pricePerNight - b.pricePerNight);

  const html = `
    <div class="results-header">
      <div class="results-title">${options.length} villas in <span>${city}</span> · ${nights} night${nights>1?'s':''} · ${sizeLabel}</div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.pricePerNight}">
      <div class="rc-hotel-info">
        <div class="rc-airline-name">${o.name}</div>
        <div class="rc-airline-code">${city} · ${o.beds} bedrooms · ${o.sizeLabel}</div>
        <div class="rc-amenities">${o.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}</div>
      </div>
      <div class="rc-rating-wrap">
        <div class="rc-rating">${o.rating}</div>
        <div class="rc-reviews">${o.reviews} reviews</div>
      </div>
      <div class="rc-price-wrap">
        <div class="rc-price">${fmt(o.pricePerNight)}</div>
        <div class="rc-per">per night · ${fmt(o.total)} total</div>
        <button class="rc-book-btn" onclick="bookNow('Villa: ${o.name}, ${city} (${nights}N)', ${o.total})">Book Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-villas', html);
}

// ── HOLIDAY PACKAGES ─────────────────────────────
const PKG_OPERATORS = ['Thomas Cook','MakeMyTrip','Yatra','Cox & Kings','SOTC','Kesari Tours'];

function searchPackages() {
  const to  = document.getElementById('pkgTo').value.trim();
  const from = document.getElementById('pkgFrom').value.trim() || 'Mumbai';
  const dur  = parseInt(document.getElementById('pkgDuration').value);
  const pax  = document.getElementById('pkgTravellers').value;
  if (!to) { showToast('Please select or enter a destination.', 'error'); return; }

  const BASE_PRICES = { Bali:42000, Maldives:68000, Europe:120000, Kerala:18000, Rajasthan:22000, Thailand:35000 };
  const base = BASE_PRICES[to] || 28000;

  const options = PKG_OPERATORS.map(op => {
    const price = Math.round(base * rand(0.88, 1.22) / 1000) * 1000;
    const rating = (4.0 + Math.random() * 0.9).toFixed(1);
    const reviews = Math.floor(rand(40, 800));
    const inclusions = ['Flights','Hotel','Breakfast','Airport Transfers','Sightseeing'].sort(() => 0.5 - Math.random()).slice(0, pick([3,4,5]));
    return { op, price, rating, reviews, inclusions, dur };
  }).sort((a, b) => a.price - b.price);

  const html = `
    <div class="results-header">
      <div class="results-title">${options.length} packages to <span>${to}</span> · ${dur} nights</div>
      <div class="results-sort">
        <button class="sort-btn active" onclick="sortResults(this,'price')">Cheapest</button>
        <button class="sort-btn" onclick="sortResults(this,'rating')">Top Rated</button>
      </div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.price}" data-rating="${o.rating}">
      <div class="rc-hotel-info">
        <div class="rc-airline-name">${o.op} — ${to} Package</div>
        <div class="rc-airline-code">${o.dur}N/${o.dur+1}D · ${from} departure</div>
        <div class="rc-amenities">${o.inclusions.map(i => `<span class="amenity-tag">✓ ${i}</span>`).join('')}</div>
      </div>
      <div class="rc-rating-wrap">
        <div class="rc-rating">${o.rating}</div>
        <div class="rc-reviews">${o.reviews} booked</div>
      </div>
      <div class="rc-price-wrap">
        <div class="rc-price">${fmt(o.price)}</div>
        <div class="rc-per">per person</div>
        <button class="rc-book-btn" onclick="bookNow('Holiday Package: ${to} via ${o.op} (${o.dur}N)', ${o.price})">Book Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-packages', html);
}

// ── CRUISE ───────────────────────────────────────
const CRUISE_LINES = [
  { name: 'Royal Caribbean',  logo: '🚢' },
  { name: 'Norwegian Cruise', logo: '🛳️' },
  { name: 'MSC Cruises',      logo: '⚓' },
  { name: 'Costa Cruises',    logo: '🌊' },
  { name: 'Celebrity Cruises', logo: '✨' },
];
const CABIN_MULT = { '1':1, '1.4':1.4, '1.8':1.8, '2.5':2.5, '4':4 };
const CABIN_NAME = { '1':'Interior','1.4':'Ocean View','1.8':'Balcony','2.5':'Mini Suite','4':'Grand Suite' };

function calculateCruise() {
  const region  = document.getElementById('cruiseRegion').value;
  const dur     = parseInt(document.getElementById('cruiseDuration').value);
  const cabin   = document.getElementById('cruiseCabin').value;
  const guests  = parseInt(document.getElementById('cruiseGuests').value) || 1;
  const port    = document.getElementById('cruiseFrom').value;

  const cabinMult = CABIN_MULT[cabin] || 1;
  const cabinName = CABIN_NAME[cabin];

  const options = CRUISE_LINES.map(c => {
    const pricePerPerson = Math.round(rand(6000, 12000) * cabinMult * dur / 100) * 100;
    const total = pricePerPerson * guests;
    const rating = (4.1 + Math.random() * 0.8).toFixed(1);
    const ports = Math.floor(rand(3, 8));
    const inclusions = ['All Meals','Entertainment','Port Taxes'].sort(() => 0.5 - Math.random()).slice(0,pick([2,3]));
    return { ...c, pricePerPerson, total, rating, ports, inclusions, cabinName, dur, guests };
  }).sort((a, b) => a.pricePerPerson - b.pricePerPerson);

  const html = `
    <div class="results-header">
      <div class="results-title">${options.length} cruises · <span>${region}</span> · ${dur} nights · ${cabinName}</div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.pricePerPerson}">
      <div class="rc-airline">
        <div class="rc-airline-logo" style="font-size:1.6rem">${o.logo}</div>
        <div>
          <div class="rc-airline-name">${o.name}</div>
          <div class="rc-airline-code">${region} · ${o.dur}N · ${o.ports} ports · ${o.cabinName}</div>
        </div>
      </div>
      <div class="rc-hotel-info" style="flex:1;padding:0 16px">
        <div class="rc-amenities">${o.inclusions.map(i => `<span class="amenity-tag">✓ ${i}</span>`).join('')}</div>
      </div>
      <div class="rc-rating-wrap">
        <div class="rc-rating">${o.rating}</div>
        <div class="rc-reviews">★ rated</div>
      </div>
      <div class="rc-price-wrap">
        <div class="rc-price">${fmt(o.pricePerPerson)}</div>
        <div class="rc-per">per person${o.guests>1?` · ${fmt(o.total)} total`:''}</div>
        <button class="rc-book-btn" onclick="bookNow('Cruise: ${region} (${o.name}, ${o.dur}N)', ${o.total})">Book Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-cruise', html);
}

// ── VISA ─────────────────────────────────────────
const VISA_AGENTS = ['VFS Global','BLS International','IVS Global','TT Services','iVisa','Atlas Visa'];

function calculateVisa() {
  const country    = document.getElementById('visaCountry').value.trim();
  const applicants = parseInt(document.getElementById('visaApplicants').value) || 1;
  const speed      = parseFloat(document.getElementById('visaSpeed').value);
  if (!country) { showToast('Please enter destination country.', 'error'); return; }

  const options = VISA_AGENTS.map(agent => {
    const fee = Math.round(rand(1800, 4500) * speed / 100) * 100;
    const days = speed === 1 ? pick(['7–10','8–12']) : speed === 1.5 ? pick(['3–5','4–6']) : pick(['1–2','2–3']);
    const rating = (4.0 + Math.random() * 0.9).toFixed(1);
    const success = Math.floor(rand(88, 99));
    return { agent, fee, days, rating, success, applicants };
  }).sort((a, b) => a.fee - b.fee);

  const html = `
    <div class="results-header">
      <div class="results-title">${options.length} visa services · <span>${country}</span> · ${applicants} applicant${applicants>1?'s':''}</div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.fee}">
      <div class="rc-hotel-info">
        <div class="rc-airline-name">${o.agent}</div>
        <div class="rc-airline-code">Processing: ${o.days} working days · ${o.success}% approval rate</div>
        <div class="rc-amenities">
          <span class="amenity-tag">✓ Document Check</span>
          <span class="amenity-tag">✓ Status Updates</span>
          <span class="amenity-tag">✓ Expert Support</span>
        </div>
      </div>
      <div class="rc-rating-wrap">
        <div class="rc-rating">${o.rating}</div>
        <div class="rc-reviews">service rating</div>
      </div>
      <div class="rc-price-wrap">
        <div class="rc-price">${fmt(o.fee)}</div>
        <div class="rc-per">service fee${o.applicants>1?` · ${fmt(o.fee*o.applicants)} total`:''}${''}</div>
        <button class="rc-book-btn" onclick="bookNow('Visa: ${country} via ${o.agent} (×${o.applicants})', ${o.fee * o.applicants})">Book Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-visa', html);
}

// ── INSURANCE ────────────────────────────────────
const INSURERS = ['HDFC Ergo','Bajaj Allianz','Tata AIG','New India Assurance','ICICI Lombard','Star Health'];

function calculateInsurance() {
  const dest       = document.getElementById('insuranceDest').value.trim();
  const fromDate   = document.getElementById('insuranceFrom').value;
  const toDate     = document.getElementById('insuranceTo').value;
  const travellers = parseInt(document.getElementById('insuranceTravellers').value) || 1;
  if (!dest) { showToast('Please enter destination.', 'error'); return; }

  const days = fromDate && toDate ? Math.max(1, Math.round((new Date(toDate)-new Date(fromDate))/86400000)) : 7;
  const selectedType = document.querySelector('#panel-insurance .info-card.selected h3')?.textContent || 'International';
  const isIntl = selectedType === 'International';

  const options = INSURERS.map(ins => {
    const premium = Math.round(rand(isIntl?120:60, isIntl?280:140) * days * travellers / 10) * 10;
    const cover = isIntl ? `$${Math.floor(rand(100,500))}K medical` : `₹${Math.floor(rand(5,20))}L cover`;
    const rating = (4.0 + Math.random() * 0.9).toFixed(1);
    const claimRatio = Math.floor(rand(88, 98));
    return { ins, premium, cover, rating, claimRatio, travellers };
  }).sort((a, b) => a.premium - b.premium);

  const html = `
    <div class="results-header">
      <div class="results-title">${options.length} plans · <span>${selectedType} · ${dest}</span> · ${days} days · ${travellers} traveller${travellers>1?'s':''}</div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.premium}">
      <div class="rc-hotel-info">
        <div class="rc-airline-name">${o.ins} Travel Shield</div>
        <div class="rc-airline-code">${o.cover} · ${o.claimRatio}% claim settlement</div>
        <div class="rc-amenities">
          <span class="amenity-tag">✓ Medical Emergency</span>
          <span class="amenity-tag">✓ Trip Cancellation</span>
          <span class="amenity-tag">✓ Lost Baggage</span>
        </div>
      </div>
      <div class="rc-rating-wrap">
        <div class="rc-rating">${o.rating}</div>
        <div class="rc-reviews">rated</div>
      </div>
      <div class="rc-price-wrap">
        <div class="rc-price">${fmt(o.premium)}</div>
        <div class="rc-per">total premium</div>
        <button class="rc-book-btn" onclick="bookNow('Insurance: ${dest} (${o.ins})', ${o.premium})">Book Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-insurance', html);
}

// ── FOREX ────────────────────────────────────────
const FOREX_PROVIDERS = ['Thomas Cook Forex','BookMyForex','Unimoni','HDFC Bank Forex','Centrum Forex','Paul Merchants'];
const RATES = { USD:83.2, EUR:90.1, GBP:105.4, AED:22.6, SGD:61.8, THB:2.3, JPY:0.55, AUD:54.2 };

function calculateForex() {
  const amt = parseFloat(document.getElementById('forexAmount').value);
  const cur = document.getElementById('forexCurrency').value;
  if (!amt || amt < 1000) { document.getElementById('forexResult').textContent='—'; document.getElementById('forexRate').textContent='Enter amount to see rate'; return; }
  const baseRate = RATES[cur] || 80;
  const result = (amt / baseRate).toFixed(2);
  document.getElementById('forexResult').textContent = result + ' ' + cur;
  document.getElementById('forexRate').textContent = `1 ${cur} = ₹${baseRate}`;
}

function orderForex() {
  const amt = parseFloat(document.getElementById('forexAmount').value);
  const cur = document.getElementById('forexCurrency').value;
  if (!amt || amt < 1000) { showToast('Please enter a valid amount (min ₹1,000).', 'error'); return; }

  const baseRate = RATES[cur] || 80;
  const options = FOREX_PROVIDERS.map(p => {
    const rate = baseRate * rand(0.97, 1.01);
    const youGet = (amt / rate).toFixed(2);
    const fee = Math.floor(rand(0, 300) / 50) * 50;
    const delivery = pick(['Same Day','Next Day','2–3 Days']);
    const rating = (4.0 + Math.random() * 0.9).toFixed(1);
    return { p, rate: rate.toFixed(2), youGet, fee, delivery, rating };
  }).sort((a, b) => parseFloat(b.youGet) - parseFloat(a.youGet));

  const html = `
    <div class="results-header">
      <div class="results-title">Best rates for <span>₹${amt.toLocaleString('en-IN')} → ${cur}</span></div>
    </div>
    ${options.map(o => `
    <div class="result-card" data-price="${o.rate}">
      <div class="rc-hotel-info">
        <div class="rc-airline-name">${o.p}</div>
        <div class="rc-airline-code">Rate: 1 ${cur} = ₹${o.rate} · ${o.delivery} delivery · ${o.fee === 0 ? 'No fee' : `₹${o.fee} fee`}</div>
        <div class="rc-amenities"><span class="amenity-tag">✓ Door Delivery</span><span class="amenity-tag">✓ RBI Licensed</span></div>
      </div>
      <div class="rc-rating-wrap">
        <div class="rc-rating">${o.rating}</div>
        <div class="rc-reviews">rated</div>
      </div>
      <div class="rc-price-wrap">
        <div class="rc-price">${o.youGet} ${cur}</div>
        <div class="rc-per">you receive</div>
        <button class="rc-book-btn" onclick="bookNow('Forex: ${o.youGet} ${cur} via ${o.p}', ${Math.round(amt)})">Order Now →</button>
      </div>
    </div>`).join('')}
  `;
  showResults('panel-forex', html);
}

// ── SORT ─────────────────────────────────────────
function sortResults(btn, key) {
  btn.closest('.results-sort').querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const box = btn.closest('.results-box');
  const cards = [...box.querySelectorAll('.result-card')];
  cards.sort((a, b) => {
    const av = parseFloat(a.dataset[key] || a.dataset.price);
    const bv = parseFloat(b.dataset[key] || b.dataset.price);
    return key === 'rating' ? bv - av : av - bv;
  });
  cards.forEach(c => box.appendChild(c));
}
