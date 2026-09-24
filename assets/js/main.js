/**
 * AMRITHA SANJIV - EDITORIAL PORTFOLIO
 * Main Navigation, Scroll Observer, and Micro-interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  initSmoothScroll();
  initActiveNavLink();
  initScrollAnimations();
  initCounterStats();
});

/* Sticky Header on Scroll */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* Mobile Menu Toggle */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    toggleBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

/* Smooth Scrolling */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length <= 1) return;

      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElem.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* Highlight Active Navigation Link on Scroll */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.pageYOffset + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* Scroll Reveal Fade-in Animations */
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.cream-card, .project-card, .timeline-card, .cert-entry, .process-step, .stat-item, .skills-container'
  );

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `all 0.65s cubic-bezier(0.25, 1, 0.5, 1) ${((index % 4) * 0.08)}s`;
    observer.observe(el);
  });
}

/* Number Counters Animation */
function initCounterStats() {
  const statsSection = document.querySelector('.section-stats');
  if (!statsSection) return;

  let counted = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        animateCounters();
      }
    });
  }, { threshold: 0.4 });

  observer.observe(statsSection);

  function animateCounters() {
    // CGPA counter
    const cgpaElem = document.getElementById('stat-cgpa');
    if (cgpaElem) {
      animateDecimalValue(cgpaElem, 0, 7.55, 1500, 2);
    }
  }

  function animateDecimalValue(element, start, end, duration, decimals) {
    let startTime = null;
    function update(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;
      element.textContent = current.toFixed(decimals);
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = end.toFixed(decimals);
      }
    }
    requestAnimationFrame(update);
  }
}
