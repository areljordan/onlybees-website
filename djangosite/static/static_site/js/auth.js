// ── AUTH.JS ──────────────────────────────────────
// Handles signup and login for OnlyBees

function signupUser() {
  const name     = document.getElementById('name').value.trim();
  const dob      = document.getElementById('dob').value;
  const address  = document.getElementById('address').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirmPassword') ? document.getElementById('confirmPassword').value : password;

  // Validation
  if (!name || !dob || !address || !email || !password) {
    showFormError('Please fill in all fields.');
    return false;
  }
  if (!isValidEmail(email)) {
    showFormError('Please enter a valid email address.');
    return false;
  }
  if (password.length < 6) {
    showFormError('Password must be at least 6 characters.');
    return false;
  }
  if (password !== confirm) {
    showFormError('Passwords do not match.');
    return false;
  }

  // Check if account already exists
  const existing = JSON.parse(localStorage.getItem('onlybeesUser'));
  if (existing && existing.email === email) {
    showFormError('An account with this email already exists.');
    return false;
  }

  const user = { name, dob, address, email, password };
  localStorage.setItem('onlybeesUser', JSON.stringify(user));

  showToast('Account created! Redirecting to login...', 'success');
  setTimeout(() => window.location.href = 'login.html', 1200);
  return false;
}

function loginUser() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showFormError('Please fill in all fields.');
    return false;
  }
  if (!isValidEmail(email)) {
    showFormError('Please enter a valid email address.');
    return false;
  }

  const storedUser = JSON.parse(localStorage.getItem('onlybeesUser'));

  if (!storedUser) {
    showFormError('No account found. Please sign up first.');
    return false;
  }

  if (email === storedUser.email && password === storedUser.password) {
    localStorage.setItem('isLoggedIn', 'true');
    showToast('Welcome back, ' + storedUser.name + '!', 'success');
    setTimeout(() => window.location.href = 'home.html', 1000);
  } else {
    showFormError('Incorrect email or password. Please try again.');
  }
  return false;
}

// Helpers
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormError(msg) {
  let el = document.getElementById('form-error');
  if (!el) {
    el = document.createElement('div');
    el.id = 'form-error';
    el.style.cssText = 'color:#c0392b;background:#fdecea;border:1px solid #f5c6cb;border-radius:8px;padding:10px 16px;margin-bottom:16px;font-size:0.88rem;font-weight:500;';
    const form = document.querySelector('form');
    form.insertBefore(el, form.firstChild);
  }
  el.textContent = msg;
  el.style.display = 'block';
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) { alert(message); return; }
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || '•'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// Clear error on input
document.querySelectorAll && document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => {
      const el = document.getElementById('form-error');
      if (el) el.style.display = 'none';
    });
  });
});
