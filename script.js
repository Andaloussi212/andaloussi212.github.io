(function () {
  var root = document.documentElement;

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Theme toggle (dark/light) with localStorage + system fallback
  var THEME_KEY = 'portfolio_theme';
  var themeToggle = document.querySelector('.theme-toggle');
  var themeIcon = document.querySelector('.theme-toggle__icon');

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      if (themeIcon) themeIcon.textContent = '☀️';
    } else {
      root.removeAttribute('data-theme');
      if (themeIcon) themeIcon.textContent = '🌙';
    }
  }

  function getPreferredTheme() {
    try {
      var saved = window.localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      // ignore
    }

    // system preference fallback
    var prefersLight = false;
    try {
      prefersLight =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: light)').matches;
    } catch (e2) {
      prefersLight = false;
    }
    return prefersLight ? 'light' : 'dark';
  }

  var currentTheme = getPreferredTheme();
  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      try {
        window.localStorage.setItem(THEME_KEY, currentTheme);
      } catch (e) {
        // ignore
      }
      applyTheme(currentTheme);
    });
  }

  // Mobile nav
  var navToggle = document.querySelector('.nav-toggle');
  var navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // close menu after clicking a link
    navMenu.addEventListener('click', function (e) {
      var target = e.target;
      if (target && target.tagName === 'A') {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // close if click outside
    document.addEventListener('click', function (e) {
      if (!navMenu.classList.contains('is-open')) return;
      var t = e.target;
      if (t === navToggle || navToggle.contains(t)) return;
      if (t === navMenu || navMenu.contains(t)) return;
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }

  // Smooth scroll (fallback friendly)
  function smoothScrollTo(el) {
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      // fallback
      var top = el.getBoundingClientRect().top + (window.pageYOffset || 0);
      window.scrollTo(0, top);
    }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;

    var id = a.getAttribute('href');
    if (!id || id.length < 2) return;

    var el = document.querySelector(id);
    if (!el) return;

    e.preventDefault();
    smoothScrollTo(el);
  });

  // Animate skill bars when visible (with fallback)
  // Use CSS variable width on ::after (already in CSS, but we set var)
  var bars = Array.prototype.slice.call(document.querySelectorAll('.bar'));

  function fillBar(bar) {
    if (!bar || bar.dataset.filled === 'true') return;
    var level = Number(bar.getAttribute('data-level') || 0);
    var clamped = Math.max(0, Math.min(100, level));
    bar.style.setProperty('--bar-width', clamped + '%');
    bar.dataset.filled = 'true';
  }

  // Inject rule to bind ::after width to variable (safe even if duplicated)
  var style = document.createElement('style');
  style.textContent = '.bar::after{width:var(--bar-width,0%);}';
  document.head.appendChild(style);

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            fillBar(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    bars.forEach(function (bar) {
      io.observe(bar);
    });
  } else {
    // Fallback: fill immediately
    bars.forEach(function (bar) {
      fillBar(bar);
    });
  }

  // Contact form (mailto)
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fd = new FormData(form);
      var name = String(fd.get('name') || '').trim();
      var email = String(fd.get('email') || '').trim();
      var message = String(fd.get('message') || '').trim();

      if (!name || !email || !message) {
        // Simple fallback for older browsers / validation quirks
        alert('Merci de remplir tous les champs.');
        return;
      }

      var subject = encodeURIComponent('Portfolio — message de ' + name);
      var body = encodeURIComponent(
        'Nom: ' +
          name +
          '\n' +
          'Email: ' +
          email +
          '\n\n' +
          'Message:\n' +
          message +
          '\n'
      );

      var to = 'zayd.benz.pro@proton.me';
      window.location.href =
        'mailto:' + to + '?subject=' + subject + '&body=' + body;
    });
  }
})();
