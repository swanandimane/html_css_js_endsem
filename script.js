// ── Navbar ─────────────────────────────────
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
}

// Close mobile menu on link click
document.querySelectorAll('.mobile-menu a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// Active nav link
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// Ripple Effect 
document.querySelectorAll('.btn-ripple').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple-fx';
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// ── Scroll Reveal ─
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Animated Counters ───────────────────────
function animateCounter(el, target, duration = 1800) {
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = prefix + Math.floor(start).toLocaleString() + suffix;
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter-num').forEach(el => counterObserver.observe(el));

// ── Hero BG Zoom on load ────────────────────
const heroBg = document.querySelector('.hero-bg');
if (heroBg) setTimeout(() => heroBg.classList.add('loaded'), 200);

// ── Smooth scroll ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
// MENU PAGE
const selectedItems = {};
let totalCost = 0;

function initMenuPage() {
  if (!document.querySelector('.menu-page')) return;

  const cuisineFilter = document.getElementById('cuisineFilter');
  const menuCards = document.querySelectorAll('.menu-card');
  const dietChips = document.querySelectorAll('.diet-chip');
  const sidebarItems = document.getElementById('sidebarItems');
  const sidebarCount = document.getElementById('sidebarCount');
  const totalEl = document.getElementById('menuTotal');
  const emptyMsg = document.getElementById('sidebarEmpty');

  // Cuisine filter
  if (cuisineFilter) {
    cuisineFilter.addEventListener('change', filterMenuItems);
  }

  // Diet chips
  dietChips.forEach(chip => {
    chip.addEventListener('click', function() {
      this.classList.toggle('active');
      filterMenuItems();
    });
  });

  function filterMenuItems() {
    const cuisine = cuisineFilter ? cuisineFilter.value : 'all';
    const activeDiets = [...dietChips].filter(c => c.classList.contains('active'))
      .map(c => c.dataset.diet);

    menuCards.forEach(card => {
      const cardCuisine = card.dataset.cuisine;
      const cardDiets = (card.dataset.diet || '').split(',');
      const cuisineMatch = cuisine === 'all' || cardCuisine === cuisine;
      const dietMatch = activeDiets.length === 0 || activeDiets.every(d => cardDiets.includes(d));
      card.classList.toggle('hidden', !(cuisineMatch && dietMatch));
    });
  }

  // Add/remove menu items
  menuCards.forEach(card => {
    card.addEventListener('click', function() {
      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = parseInt(this.dataset.price);

      if (selectedItems[id]) {
        // Remove
        delete selectedItems[id];
        this.classList.remove('selected');
        totalCost -= price;
        const item = sidebarItems.querySelector(`[data-item="${id}"]`);
        if (item) item.remove();
      } else {
        // Add
        selectedItems[id] = { name, price };
        this.classList.add('selected');
        totalCost += price;
        appendSidebarItem(id, name, price);
      }
      updateSidebar();
    });
  });

  function appendSidebarItem(id, name, price) {
    if (emptyMsg) emptyMsg.style.display = 'none';
    const div = document.createElement('div');
    div.className = 'sidebar-item';
    div.dataset.item = id;
    div.innerHTML = `
      <span class="sidebar-item-name">${name}</span>
      <span class="sidebar-item-price">₹${price}</span>
      <button class="sidebar-item-remove" title="Remove">✕</button>`;
    div.querySelector('.sidebar-item-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      delete selectedItems[id];
      totalCost -= price;
      div.remove();
      const card = document.querySelector(`.menu-card[data-id="${id}"]`);
      if (card) card.classList.remove('selected');
      updateSidebar();
    });
    sidebarItems.appendChild(div);
  }

  function updateSidebar() {
    const count = Object.keys(selectedItems).length;
    if (sidebarCount) sidebarCount.textContent = count;
    if (totalEl) totalEl.textContent = '₹' + totalCost.toLocaleString();
    if (emptyMsg) emptyMsg.style.display = count === 0 ? 'flex' : 'none';
  }
}

// ══════════════════════════════════════════════
// PACKAGES PAGE
// ══════════════════════════════════════════════
function initPackagesPage() {
  const guestInput = document.getElementById('guestCount');
  const pkgSelect = document.getElementById('pkgSelect');
  const calcBtn = document.getElementById('calcBtn');
  const calcResultEl = document.getElementById('calcResult');

  const PKG_PRICES = { basic: 499, premium: 799, luxury: 1199 };

  function calculateCost() {
    const guests = parseInt(guestInput?.value) || 0;
    const pkg = pkgSelect?.value || 'basic';
    const total = guests * (PKG_PRICES[pkg] || 0);
    if (calcResultEl) {
      calcResultEl.textContent = total > 0 ? '₹' + total.toLocaleString() : '₹0';
    }
  }

  if (calcBtn) calcBtn.addEventListener('click', calculateCost);
  if (guestInput) guestInput.addEventListener('input', calculateCost);
  if (pkgSelect) pkgSelect.addEventListener('change', calculateCost);

  // Package select buttons
  document.querySelectorAll('.pkg-select-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const pkg = this.dataset.pkg;
      if (pkgSelect) { pkgSelect.value = pkg; calculateCost(); }
      const calcSection = document.getElementById('guestCalc');
      if (calcSection) calcSection.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ══════════════════════════════════════════════
// BOOKING PAGE
// ══════════════════════════════════════════════
function initBookingPage() {
  if (!document.querySelector('.booking-page')) return;

  const guestInput = document.getElementById('bookingGuests');
  const pkgSelect = document.getElementById('bookingPkg');
  const costEl = document.getElementById('estimatedCost');
  const guestDisplayEl = document.getElementById('summaryGuests');
  const pkgDisplayEl = document.getElementById('summaryPkg');

  const PKG_PRICES = { basic: 499, premium: 799, luxury: 1199 };
  const PKG_NAMES = { basic: 'Basic (₹499/plate)', premium: 'Premium (₹799/plate)', luxury: 'Luxury (₹1199/plate)' };

  function updateCost() {
    const guests = parseInt(guestInput?.value) || 0;
    const pkg = pkgSelect?.value || 'basic';
    const total = guests * (PKG_PRICES[pkg] || 499);
    if (costEl) costEl.textContent = '₹' + total.toLocaleString();
    if (guestDisplayEl) guestDisplayEl.textContent = guests || '—';
    if (pkgDisplayEl) pkgDisplayEl.textContent = PKG_NAMES[pkg] || '—';
  }

  if (guestInput) guestInput.addEventListener('input', updateCost);
  if (pkgSelect) pkgSelect.addEventListener('change', updateCost);

  // Radio buttons
  document.querySelectorAll('.radio-label').forEach(label => {
    label.addEventListener('click', function() {
      const name = this.querySelector('input')?.name;
      document.querySelectorAll(`.radio-label input[name="${name}"]`).forEach(inp => {
        inp.parentElement.classList.remove('checked');
      });
      this.querySelector('input').checked = true;
      this.classList.add('checked');
    });
  });

  // Form submit
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = this.querySelector('[type="submit"]');
      btn.textContent = '⏳ Processing...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✅ Booking Confirmed!';
        btn.style.background = 'linear-gradient(135deg, #06d6a0, #04a882)';
        setTimeout(() => {
          btn.textContent = '🎉 Book My Event';
          btn.disabled = false;
          btn.style.background = '';
          this.reset();
          updateCost();
        }, 3500);
      }, 1600);
    });
  }
}

function initContactPage() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('[type="submit"]');
    const successMsg = document.getElementById('contactSuccess');
    btn.textContent = '⏳ Sending...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✔ Message Sent';
      if (successMsg) successMsg.classList.add('show');
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
        if (successMsg) successMsg.classList.remove('show');
        contactForm.reset();
      }, 3500);
    }, 1400);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMenuPage();
  initPackagesPage();
  initBookingPage();
  initContactPage();
});
