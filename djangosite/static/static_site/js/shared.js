// shared-header.js — call renderHeader() on all pages

function renderHeader(activePage) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const cart = JSON.parse(localStorage.getItem('checkoutServices')) || [];
  const cartCount = cart.length;

  const pages = [
    { id: 'home', label: 'Home', href: 'home.html' },
    { id: 'services', label: 'Services', href: 'services.html' },
    { id: 'wishlist', label: 'Checkout', href: 'wishlist.html', cart: true },
    { id: 'auth', label: isLoggedIn ? 'Logout' : 'Login', href: isLoggedIn ? '#' : 'login.html', action: isLoggedIn ? 'logout' : null },
  ];

  const navLinks = pages.map(p => {
    let badge = '';
    if (p.cart && cartCount > 0) badge = `<span class="badge">${cartCount}</span>`;
    const active = p.id === activePage ? 'active' : '';
    const action = p.action === 'logout' ? 'onclick="logoutUser()" ' : '';
    return `<a href="${p.href}" class="${active}" ${action}>${p.label}${badge}</a>`;
  }).join('');

  document.querySelector('header').innerHTML = `
    <a href="home.html" class="header-logo">Only<span>Bees</span>.</a>
    <nav id="main-nav">
      ${navLinks}
      <a href="services.html" class="nav-cta">Book Now</a>
    </nav>
    <div class="menu-toggle" onclick="toggleMenu()" aria-label="Menu">
      <span></span><span></span><span></span>
    </div>
  `;
}

function toggleMenu() {
  document.getElementById('main-nav').classList.toggle('open');
}

function logoutUser() {
  localStorage.removeItem('isLoggedIn');
  showToast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = 'home.html', 800);
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function renderFooter() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="logo">Only<span>Bees</span>.</div>
        <p>Simplifying your travel experience, one booking at a time. Your trusted companion for every journey.</p>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <a href="services.html#flights">Flights</a>
        <a href="services.html#trains">Trains</a>
        <a href="services.html#hotels">Hotels</a>
        <a href="services.html#airbnb">Airbnb</a>
        <a href="services.html#cabs">Cab Rentals</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="#">About Us</a>
        <a href="#">Careers</a>
        <a href="#">Blog</a>
      </div>
      <div class="footer-col">
        <h4>Support</h4>
        <a href="#">Help Centre</a>
        <a href="#">Contact Us</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2024 OnlyBees. All rights reserved.</span>
      <span>Made with ♥ for Indian travellers</span>
    </div>
  `;
}
