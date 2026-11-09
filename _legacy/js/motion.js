/**
 * Antigravity Motion System - Modular Motion Controller
 * Hard budget: < 3 KB gzipped, zero libraries, compositor-only transform/opacity.
 */
(function() {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
    return;
  }

  document.addEventListener('DOMContentLoaded', function() {
    // 1. Single Shared IntersectionObserver for Below-the-Fold Scroll Reveals
    var revealElements = document.querySelectorAll('.scroll-reveal');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
      var revealObserver = new IntersectionObserver(function(entries, observer) {
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        }
      }, {
        threshold: 0.05,
        rootMargin: '40px 0px -20px 0px'
      });

      var staggerGroups = document.querySelectorAll('.stagger-group');
      for (var g = 0; g < staggerGroups.length; g++) {
        var items = staggerGroups[g].querySelectorAll('.scroll-reveal');
        for (var k = 0; k < items.length; k++) {
          items[k].style.setProperty('--stagger-delay', (k * 60) + 'ms');
        }
      }

      for (var j = 0; j < revealElements.length; j++) {
        revealObserver.observe(revealElements[j]);
      }
    } else {
      for (var m = 0; m < revealElements.length; m++) {
        revealElements[m].classList.add('revealed');
      }
    }

    // 2. Desktop-Only Cursor Spotlight for Interactive Cards
    var isDesktopPointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isDesktopPointer) {
      var cards = document.querySelectorAll('.card-interactive');
      for (var c = 0; c < cards.length; c++) {
        (function(card) {
          var ticking = false;
          var mouseX = 0;
          var mouseY = 0;

          function updateSpotlight() {
            var rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (mouseX - rect.left) + 'px');
            card.style.setProperty('--mouse-y', (mouseY - rect.top) + 'px');
            ticking = false;
          }

          card.addEventListener('pointermove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!ticking) {
              requestAnimationFrame(updateSpotlight);
              ticking = true;
            }
          }, { passive: true });

          card.addEventListener('pointerleave', function() {
            card.style.removeProperty('--mouse-x');
            card.style.removeProperty('--mouse-y');
          }, { passive: true });
        })(cards[c]);
      }
    }

    // 3. Optional Counter for YOLO Metric (>90% Evaluation)
    var metricCounter = document.getElementById('yolo-precision-counter');
    if (metricCounter && 'IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(function(entries, observer) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            observer.unobserve(entries[i].target);
            var targetNum = 90;
            var duration = 800;
            var startTime = null;

            function step(timestamp) {
              if (!startTime) startTime = timestamp;
              var progress = Math.min((timestamp - startTime) / duration, 1);
              var eased = 1 - Math.pow(1 - progress, 3);
              var current = Math.floor(eased * targetNum);
              metricCounter.textContent = '>' + current + '% EVALUATION';
              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                metricCounter.textContent = '>90% EVALUATION';
              }
            }
            requestAnimationFrame(step);
          }
        }
      }, { threshold: 0.2 });
      counterObserver.observe(metricCounter);
    }
  });
})();
