// ===== Navbar scroll =====
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ===== Active nav link =====
const page = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
  if (link.getAttribute('href') === page) link.classList.add('active');
});

// ===== Mobile nav =====
const hamburger  = document.querySelector('.hamburger');
const mobileNav  = document.querySelector('.mobile-nav');
const mobileClose = document.querySelector('.mobile-close');

function openMobile() {
  hamburger.classList.add('open');
  mobileNav.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobile() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', () => {
  hamburger.classList.contains('open') ? closeMobile() : openMobile();
});
if (mobileClose) mobileClose.addEventListener('click', closeMobile);
document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', closeMobile));

// ===== Hero bg zoom =====
const heroBg = document.querySelector('.hero-bg');
if (heroBg) setTimeout(() => heroBg.classList.add('loaded'), 80);

// ===== Fade-up on scroll =====
const fadeEls = document.querySelectorAll('.fade-up');
if (fadeEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => io.observe(el));
}

// ===== Lightbox =====
const lightbox     = document.querySelector('.lightbox');
const lightboxImg  = document.querySelector('.lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    if (!img || !lightbox) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// ===== Contact form =====
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Message Sent!';
    btn.disabled = true;
    btn.style.background = '#4CAF50';
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      btn.style.background = '';
      form.reset();
    }, 3500);
  });
}
