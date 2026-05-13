import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Swup from 'swup'
import PreloadPlugin from '@swup/preload-plugin'
import BodyClassPlugin from '@swup/body-class-plugin'

// ===== Setup =====
gsap.registerPlugin(ScrollTrigger)
gsap.ticker.lagSmoothing(0)

// ===== Lenis smooth scroll (shared RAF loop with GSAP) =====
const lenis = new Lenis({
  duration: 1.2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add(time => lenis.raf(time * 1000))

// ===== Swup =====
const swup = new Swup({
  containers: ['#swup'],
  plugins: [new PreloadPlugin(), new BodyClassPlugin()],
})

swup.hooks.on('page:view', () => {
  lenis.scrollTo(0, { immediate: true })
  ScrollTrigger.getAll().forEach(st => st.kill())
  if (_ctx) _ctx.revert()
  initPage()
})

swup.hooks.on('animation:in:end', () => ScrollTrigger.refresh())

// ===== Navbar scroll (outside #swup — attach once) =====
const siteHeader = document.querySelector('.site-header')
window.addEventListener('scroll', () => {
  siteHeader?.classList.toggle('scrolled', window.scrollY > 50)
}, { passive: true })

// ===== Hamburger nav (outside #swup — attach once) =====
const hamburger   = document.querySelector('.hamburger')
const mobileNav   = document.querySelector('.mobile-nav')
const mobileClose = document.querySelector('.mobile-close')

function openMobile() {
  hamburger?.classList.add('open')
  mobileNav?.classList.add('open')
  document.body.style.overflow = 'hidden'
}
function closeMobile() {
  hamburger?.classList.remove('open')
  mobileNav?.classList.remove('open')
  document.body.style.overflow = ''
}
hamburger?.addEventListener('click', openMobile)
mobileClose?.addEventListener('click', closeMobile)
document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', closeMobile))

// ===== Per-page state (reset on every Swup transition) =====
let _ctx                 = null   // GSAP context for animations
let _heroParallaxHandler = null   // scroll listener for hero parallax
let _lbKeydown           = null   // keydown listener for lightbox
let _lbPopstate          = null   // popstate listener for lightbox back-button

// ============================================================
//   initPage — fires on first load + every Swup page:view
// ============================================================
function initPage() {
  _ctx = gsap.context(() => {
    initHeroEntrance()
    initScrollReveals()
  })
  initNavActive()
  initParallax()
  initLightbox()
  initContactForm()
}

// ===== Active nav link =====
function initNavActive() {
  const raw  = window.location.pathname.replace(/\/$/, '')
  const path = raw === '' ? '/' : raw

  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    link.classList.remove('active')
    const href = (link.getAttribute('href') || '').replace(/\/$/, '') || '/'
    if (href === path) link.classList.add('active')
  })
}

// ===== Hero entrance (home page only) =====
function initHeroEntrance() {
  const words = document.querySelectorAll('.hero-content .word')
  if (!words.length) return

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  tl.from(words,                        { opacity: 0, y: 60, duration: 0.9, stagger: 0.07 })
    .from('.hero-content .section-label',{ opacity: 0, y: 20, duration: 0.6 }, 0)
    .from('.hero-content p',             { opacity: 0, y: 24, duration: 0.7 }, 0.5)
    .from('.hero-actions .btn',          { opacity: 0, y: 20, stagger: 0.1, duration: 0.6 }, 0.65)
    .from('.hero-badge',                 { opacity: 0, x: 20, duration: 0.6 }, 0.85)
}

// ===== Scroll reveals =====
function initScrollReveals() {
  // Individual .reveal elements
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 44, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  })

  // .reveal-group — children stagger in
  gsap.utils.toArray('.reveal-group').forEach(group => {
    gsap.from(group.children, {
      opacity: 0, y: 36, duration: 0.7, stagger: 0.11, ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 88%', once: true },
    })
  })

  // .image-reveal — clip-path left-to-right wipe
  gsap.utils.toArray('.image-reveal').forEach(el => {
    gsap.from(el, {
      clipPath: 'inset(0 100% 0 0)',
      duration: 1.1, ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })
  })

  // Gallery — timed stagger (avoids Swup/ScrollTrigger race condition)
  const galleryItems = document.querySelectorAll('.gallery-item')
  if (galleryItems.length) {
    gsap.from(galleryItems, {
      opacity: 0, y: 32, duration: 0.7, stagger: 0.08, ease: 'power3.out', delay: 0.25,
    })
  }
}

// ===== Parallax hero bg (desktop only — disabled ≤ 860px) =====
function initParallax() {
  const heroBg = document.querySelector('.hero-bg')
  if (!heroBg) return

  if (_heroParallaxHandler) {
    window.removeEventListener('scroll', _heroParallaxHandler, { passive: true })
    _heroParallaxHandler = null
  }

  if (window.innerWidth <= 860) {
    heroBg.style.transform = 'scale(1)'
    return
  }

  _heroParallaxHandler = () => {
    heroBg.style.transform = `scale(1.06) translateY(${window.scrollY * 0.25}px)`
  }
  window.addEventListener('scroll', _heroParallaxHandler, { passive: true })
}

// ===== Lightbox =====
function initLightbox() {
  const lightbox = document.querySelector('.lightbox')
  const lbImg    = document.querySelector('.lightbox-img')
  const closeBtn = document.querySelector('.lightbox-close')
  if (!lightbox || !lbImg) return

  // Remove old listeners to avoid duplicates after Swup transitions
  if (_lbKeydown)  document.removeEventListener('keydown',  _lbKeydown)
  if (_lbPopstate) window.removeEventListener('popstate', _lbPopstate)

  function openLb(src, alt) {
    lbImg.src = src
    lbImg.alt = alt
    lightbox.classList.add('open')
    document.body.style.overflow = 'hidden'
    history.pushState({ lightbox: true }, '')
  }
  function closeLb() {
    lightbox.classList.remove('open')
    document.body.style.overflow = ''
  }

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img')
      if (img) openLb(img.src, img.alt)
    })
  })

  closeBtn?.addEventListener('click', closeLb)
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLb() })

  _lbKeydown  = e => { if (e.key === 'Escape') closeLb() }
  _lbPopstate = e => { if (!e.state?.lightbox) closeLb() }

  document.addEventListener('keydown',  _lbKeydown)
  window.addEventListener('popstate', _lbPopstate)
}

// ===== Contact form =====
function initContactForm() {
  const form = document.querySelector('.contact-form')
  if (!form) return
  // Remove previous listener to avoid stacking
  const newForm = form.cloneNode(true)
  form.parentNode.replaceChild(newForm, form)
  newForm.addEventListener('submit', e => {
    e.preventDefault()
    const btn  = newForm.querySelector('button[type="submit"]')
    const orig = btn.textContent
    btn.textContent = 'Message Sent! ✓'
    btn.disabled = true
    btn.style.background = '#4CAF50'
    setTimeout(() => {
      btn.textContent = orig
      btn.disabled    = false
      btn.style.background = ''
      newForm.reset()
    }, 3500)
  })
}

// ===== Boot =====
initPage()
