/* ============================================
   HAFIZ AHMED — PORTFOLIO
   Interactions & Animations
   ============================================ */

(function () {
  'use strict';

  // ----------------------------
  // Navigation: Scroll Behavior
  // ----------------------------
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function handleNavScroll() {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ----------------------------
  // Mobile Navigation
  // ----------------------------
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  const overlay = document.getElementById('mobileOverlay');

  function toggleMenu() {
    const isOpen = navLinks.classList.contains('open');

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    navLinks.classList.add('open');
    hamburger.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // ----------------------------
  // Active Nav Link on Scroll
  // ----------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinkElements = document.querySelectorAll('.nav__link');

  function highlightActiveLink() {
    const scrollY = window.scrollY + 120;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinkElements.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightActiveLink, { passive: true });

  // ----------------------------
  // Scroll Reveal Animations
  // ----------------------------
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  // ----------------------------
  // Experience Tabs
  // ----------------------------
  const tabs = document.querySelectorAll('.exp__tab');
  const panels = document.querySelectorAll('.exp__panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var targetId = tab.getAttribute('data-tab');

      // Deactivate all
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function (p) {
        p.classList.remove('active');
      });

      // Activate selected
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById('panel-' + targetId).classList.add('active');
    });
  });

  // ----------------------------
  // Smooth Scroll for Anchors
  // ----------------------------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;

      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ----------------------------
  // Subtle Parallax on Hero
  // ----------------------------
  var heroGlow = document.querySelector('.hero__bg-glow');

  if (heroGlow) {
    window.addEventListener('mousemove', function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 30;
      var y = (e.clientY / window.innerHeight - 0.5) * 30;
      heroGlow.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    }, { passive: true });
  }

  // ----------------------------
  // Console Easter Egg
  // ----------------------------
  console.log(
    '%c  Hafiz Ahmed  ',
    'background: #0a192f; color: #64ffda; font-size: 16px; padding: 8px 16px; font-family: monospace; border: 1px solid #64ffda;'
  );
  console.log(
    '%cInterested in working together? → hafiznapster@gmail.com',
    'color: #8892b0; font-size: 12px; font-family: monospace;'
  );

})();
