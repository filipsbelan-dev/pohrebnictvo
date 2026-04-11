document.addEventListener('DOMContentLoaded', function () {

  // ── Sticky header shadow ──
  var header = document.getElementById('header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // ── Hero ken-burns ──
  var hero = document.getElementById('hero');
  if (hero) setTimeout(function () { hero.classList.add('loaded'); }, 100);

  // ── Page banners ken-burns on scroll ──
  var banners = document.querySelectorAll('.page-banner');
  if ('IntersectionObserver' in window && banners.length) {
    var bannerIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add('in-view');
      });
    }, { threshold: 0.1 });
    banners.forEach(function (b) { bannerIO.observe(b); });
  }

  // ── Hamburger ──
  var btn = document.getElementById('hamburger');
  var navUl = document.querySelector('nav > ul');
  if (btn && navUl) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      navUl.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (navUl.classList.contains('open') && !navUl.contains(e.target)) {
        navUl.classList.remove('open');
      }
    });
  }

  // ── Scroll-triggered fade-up ──
  var fadeEls = document.querySelectorAll('.fade-up');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(function (el) {
      el.style.animationPlayState = 'paused';
      io.observe(el);
    });
  }

});
