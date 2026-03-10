// ── CHECKOUT.JS ─────────────────────────────────
// Manages the 3-step checkout flow: Summary → Details → Payment

// ─── STEP MANAGEMENT ────────────────────────────
let currentStep = 1;

function setStep(step, fromStep) {
  // Mark previous steps as done
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`step-${i}`);
    if (el) el.style.display = i === step ? 'block' : 'none';
    const circle = document.getElementById(`prog-${i}`);
    if (circle) {
      circle.parentElement.classList.remove('active', 'done');
      if (i < step) circle.parentElement.classList.add('done');
      if (i === step) circle.parentElement.classList.add('active');
    }
    const line = document.getElementById(`line-${i}`);
    if (line) {
      line.classList.toggle('done', i < step);
    }
  }
  currentStep = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── LOAD SUMMARY ───────────────────────────────
function loadCheckout() {
  const cart   = JSON.parse(localStorage.getItem('checkoutServices')) || [];
  const list   = document.getElementById('checkoutItems');
  const totalEl = document.getElementById('totalAmount');

  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="padding:40px 0">
        <div class="icon">🧳</div>
        <h3>Your checkout is empty</h3>
        <p>Head over to Services to add items.</p>
        <a href="services.html" class="btn btn-primary" style="margin-top:16px">Browse Services</a>
      </div>
    `;
    if (totalEl) totalEl.textContent = '0';
    document.getElementById('summary-continue-btn').style.display = 'none';
    return;
  }

  document.getElementById('summary-continue-btn').style.display = 'flex';

  let total = 0;
  cart.forEach((item, i) => {
    total += item.price;
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
      <div class="order-item-info">
        <div class="order-item-name">${item.name}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span class="order-item-price">₹${item.price.toLocaleString('en-IN')}</span>
        <button class="order-item-remove" onclick="removeItem(${i})" title="Remove">×</button>
      </div>
    `;
    list.appendChild(div);
  });

  if (totalEl) totalEl.textContent = total.toLocaleString('en-IN');
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('checkoutServices')) || [];
  cart.splice(index, 1);
  localStorage.setItem('checkoutServices', JSON.stringify(cart));
  loadCheckout();
  showToast('Item removed.', 'info');
}

// ─── STEP NAVIGATION ────────────────────────────
function goToDetails() {
  const cart = JSON.parse(localStorage.getItem('checkoutServices')) || [];
  if (cart.length === 0) { showToast('Add at least one service before continuing.', 'error'); return; }
  setStep(2);
}

function goToPayment() {
  const name    = document.getElementById('fullName').value.trim();
  const dob     = document.getElementById('dob').value;
  const address = document.getElementById('address').value.trim();
  const email   = document.getElementById('detailsEmail') ? document.getElementById('detailsEmail').value.trim() : '';

  if (!name || !dob || !address) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  if (email && !isValidEmail(email)) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  // Show order review in payment step
  const cart = JSON.parse(localStorage.getItem('checkoutServices')) || [];
  const total = cart.reduce((s, i) => s + i.price, 0);
  const reviewEl = document.getElementById('payment-review');
  if (reviewEl) {
    reviewEl.innerHTML = `
      <div style="padding:14px 0;border-bottom:1px solid var(--border);margin-bottom:14px">
        ${cart.map(i => `<div class="order-item"><span>${i.name}</span><strong>₹${i.price.toLocaleString('en-IN')}</strong></div>`).join('')}
      </div>
      <div class="order-total-row"><span class="lbl">Total Amount</span><span class="val">₹${total.toLocaleString('en-IN')}</span></div>
    `;
  }

  setStep(3);
}

// ─── PLACE ORDER ────────────────────────────────
function placeOrder() {
  const paymentMethod = document.querySelector('input[name="payment"]:checked');
  if (!paymentMethod) { showToast('Please select a payment method.', 'error'); return; }

  const cart  = JSON.parse(localStorage.getItem('checkoutServices')) || [];
  const total = cart.reduce((s, i) => s + i.price, 0);
  const name  = document.getElementById('fullName').value.trim();

  // Save order to history
  const order = {
    id: 'OB' + Date.now(),
    date: new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
    items: cart,
    total,
    payment: paymentMethod.value,
    name,
  };
  const history = JSON.parse(localStorage.getItem('orderHistory')) || [];
  history.unshift(order);
  localStorage.setItem('orderHistory', JSON.stringify(history));

  // Clear cart
  localStorage.removeItem('checkoutServices');

  // Show success screen
  document.getElementById('step-3').style.display = 'none';
  const successEl = document.getElementById('step-success');
  if (successEl) {
    successEl.style.display = 'block';
    document.getElementById('success-order-id').textContent = order.id;
    document.getElementById('success-total').textContent = '₹' + total.toLocaleString('en-IN');
  }

  // Update progress bar
  for (let i = 1; i <= 3; i++) {
    const p = document.getElementById(`prog-${i}`);
    if (p) { p.textContent = '✓'; p.parentElement.classList.add('done'); p.parentElement.classList.remove('active'); }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── HELPERS ────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
  loadCheckout();
  setStep(1);

  // Payment option selection
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const radio = opt.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
});
