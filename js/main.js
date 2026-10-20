// Direct Email Composer & Copy Email Functions (Available immediately)
window.openDirectEmail = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  var email = 'robertuswilliamsusanto@gmail.com';
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = 'mailto:' + email;
  } else {
    var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(email);
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  }
};

window.copyEmailAddress = function(btn) {
  var email = 'robertuswilliamsusanto@gmail.com';
  var label = btn.querySelector('.copy-label') || btn;
  var originalText = label.textContent;

  function showFeedback() {
    label.textContent = 'COPIED TO CLIPBOARD!';
    btn.classList.add('bg-secondary-container', 'text-secondary-fixed');
    setTimeout(function() {
      label.textContent = originalText;
      btn.classList.remove('bg-secondary-container', 'text-secondary-fixed');
    }, 2200);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).then(showFeedback).catch(function() {
      window.location.href = 'mailto:' + email;
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = email;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showFeedback();
    } catch (err) {
      window.location.href = 'mailto:' + email;
    }
    document.body.removeChild(ta);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // 1. Theme toggle listeners
  var themeBtns = document.querySelectorAll('.theme-toggle-btn');
  themeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        try { localStorage.setItem('theme', 'light'); } catch(e) {}
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        try { localStorage.setItem('theme', 'dark'); } catch(e) {}
      }
    });
  });

  // 2. Mobile drawer navigation
  var drawer = document.getElementById('mobile-drawer');
  var drawerOpenBtn = document.getElementById('mobile-drawer-open');
  var drawerCloseBtn = document.getElementById('mobile-drawer-close');
  var drawerLinks = drawer ? drawer.querySelectorAll('a') : [];

  function openDrawer() {
    if (drawer) {
      drawer.classList.remove('hidden');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (drawerCloseBtn) drawerCloseBtn.focus();
    }
  }

  function closeDrawer() {
    if (drawer) {
      drawer.classList.add('hidden');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (drawerOpenBtn) drawerOpenBtn.focus();
    }
  }

  if (drawerOpenBtn) drawerOpenBtn.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  drawerLinks.forEach(function(link) {
    link.addEventListener('click', closeDrawer);
  });

  // 3. Zero-Reflow IntersectionObserver for Active Section Highlighting
  var desktopNavLinks = document.querySelectorAll('#desktop-nav a');
  var bottomNavLinks = document.querySelectorAll('#bottom-nav a');

  function setActive(id) {
    desktopNavLinks.forEach(function(a) {
      if (a.getAttribute('href') === '#' + id) {
        a.classList.add('text-primary', 'bg-surface-container');
        a.classList.remove('text-on-surface-variant');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('text-primary', 'bg-surface-container');
        a.classList.add('text-on-surface-variant');
        a.removeAttribute('aria-current');
      }
    });

    bottomNavLinks.forEach(function(a) {
      if (a.getAttribute('href') === '#' + id) {
        a.classList.add('text-primary', 'font-medium');
        a.classList.remove('text-on-surface-variant');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('text-primary', 'font-medium');
        a.classList.add('text-on-surface-variant');
        a.removeAttribute('aria-current');
      }
    });
  }

  var sectionIds = ['about', 'projects', 'experience', 'skills', 'education', 'contact'];
  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px'
    });

    sectionIds.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) navObserver.observe(el);
    });
  }

  // 4. Scroll reveal with IntersectionObserver (respects prefers-reduced-motion)
  var isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isReducedMotion && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries, obs) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    document.querySelectorAll('.scroll-reveal').forEach(function(el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.scroll-reveal').forEach(function(el) {
      el.classList.add('revealed');
    });
  }
});
