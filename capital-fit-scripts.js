console.log("hello");

function initNavigation() {
    if (!initNavigation._hasResizeListener) {
      initNavigation._hasResizeListener = true;
      window.addEventListener('resize', debounce(initNavigation, 200));
    }

    const isMobile = window.innerWidth < 992;
    if (isMobile && initNavigation._lastMode !== 'mobile') {
      initMobileMenu();
      initNavigation._lastMode = 'mobile';
    } else if (!isMobile && initNavigation._lastMode !== 'desktop') {
      initDesktopDropdowns();
      initNavigation._lastMode = 'desktop';
    }
  }

  function debounce(fn, delay) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function initMobileMenu() {
    const btn = document.querySelector('[data-menu-button]');
    const nav = document.querySelector('[data-menu-status]');
    if (!btn || !nav) return;

    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'mobile-navigation');
    nav.setAttribute('id', 'mobile-navigation');
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    if (!btn._mobileClick) {
      btn._mobileClick = true;
      btn.addEventListener('click', () => {
        const open = nav.dataset.menuStatus === 'open';
        nav.dataset.menuStatus = open ? 'closed' : 'open';
        btn.setAttribute('aria-expanded', !open);

        // Close all dropdowns when closing the menu
        if (open) {
          Array.from(document.querySelectorAll('[data-dropdown-toggle]')).forEach(toggle => {
            toggle.dataset.dropdownToggle = 'closed';
            toggle.setAttribute('aria-expanded', 'false');
          });
        }
      });
    }

    Array.from(document.querySelectorAll('[data-dropdown-toggle]')).forEach((toggle, i) => {
      const dd = toggle.nextElementSibling;
      if (!dd || !dd.classList.contains('nav-dropdown')) return;
      if (toggle._mobileDropdownInit) return;
      toggle._mobileDropdownInit = true;

      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-haspopup', 'true');
      toggle.setAttribute('aria-controls', `dropdown-${i}`);

      dd.setAttribute('id', `dropdown-${i}`);
      dd.setAttribute('role', 'menu');
      dd.querySelectorAll('.nav-dropdown__link')
        .forEach(link => link.setAttribute('role', 'menuitem'));

      toggle.addEventListener('click', () => {
        const open = toggle.dataset.dropdownToggle === 'open';
        Array.from(document.querySelectorAll('[data-dropdown-toggle]'))
          .forEach(other => {
            if (other !== toggle) {
              other.dataset.dropdownToggle = 'closed';
              other.setAttribute('aria-expanded', 'false');
              if (other === document.activeElement) other.blur();
            }
          });
        toggle.dataset.dropdownToggle = open ? 'closed' : 'open';
        toggle.setAttribute('aria-expanded', !open);
        if (open && toggle === document.activeElement) toggle.blur();
      });
    });
  }

  function initDesktopDropdowns() {
    const toggles = Array.from(document.querySelectorAll('[data-dropdown-toggle]'));
    const links = Array.from(document.querySelectorAll('.nav-link:not([data-dropdown-toggle])'));

    toggles.forEach((toggle, i) => {
      const dd = toggle.nextElementSibling;
      if (!dd || !dd.classList.contains('nav-dropdown') || toggle._desktopInit) return;
      toggle._desktopInit = true;

      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-haspopup', 'true');
      toggle.setAttribute('aria-controls', `desktop-dropdown-${i}`);

      dd.setAttribute('id', `desktop-dropdown-${i}`);
      dd.setAttribute('role', 'menu');
      dd.setAttribute('aria-hidden', 'true');
      dd.querySelectorAll('.nav-dropdown__link')
        .forEach(link => link.setAttribute('role', 'menuitem'));

      toggle.addEventListener('click', e => {
        e.preventDefault();
        toggles.forEach(other => {
          if (other !== toggle) {
            other.dataset.dropdownToggle = 'closed';
            other.setAttribute('aria-expanded', 'false');
            const otherDropdown = other.nextElementSibling;
            if (otherDropdown) otherDropdown.setAttribute('aria-hidden', 'true');
          }
        });
        const open = toggle.dataset.dropdownToggle !== 'open';
        toggle.dataset.dropdownToggle = 'open';
        toggle.setAttribute('aria-expanded', 'true');
        dd.setAttribute('aria-hidden', 'false');
        if (open) {
          const first = dd.querySelector('.nav-dropdown__link');
          if (first) first.focus();
        }
      });

      toggle.addEventListener('mouseenter', () => {
        const anyOpen = toggles.some(x => x.dataset.dropdownToggle === 'open');
        toggles.forEach(other => {
          if (other !== toggle) {
            other.dataset.dropdownToggle = 'closed';
            other.setAttribute('aria-expanded', 'false');
            const otherDropdown = other.nextElementSibling;
            if (otherDropdown) otherDropdown.setAttribute('aria-hidden', 'true');
          }
        });
        if (anyOpen) {
          setTimeout(() => {
            toggle.dataset.dropdownToggle = 'open';
            toggle.setAttribute('aria-expanded', 'true');
            dd.setAttribute('aria-hidden', 'false');
          }, 20);
        } else {
          toggle.dataset.dropdownToggle = 'open';
          toggle.setAttribute('aria-expanded', 'true');
          dd.setAttribute('aria-hidden', 'false');
        }
      });

      dd.addEventListener('mouseleave', () => {
        toggle.dataset.dropdownToggle = 'closed';
        toggle.setAttribute('aria-expanded', 'false');
        dd.setAttribute('aria-hidden', 'true');
      });

      toggle.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.click();
        } else if (e.key === 'Escape') {
          toggle.dataset.dropdownToggle = 'closed';
          toggle.setAttribute('aria-expanded', 'false');
          dd.setAttribute('aria-hidden', 'true');
          toggle.focus();
        }
      });

      dd.addEventListener('keydown', e => {
        const items = Array.from(dd.querySelectorAll('.nav-dropdown__link'));
        const idx = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[(idx + 1) % items.length].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          items[(idx - 1 + items.length) % items.length].focus();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          toggle.dataset.dropdownToggle = 'closed';
          toggle.setAttribute('aria-expanded', 'false');
          dd.setAttribute('aria-hidden', 'true');
          toggle.focus();
        } else if (e.key === 'Tab' && !dd.contains(e.relatedTarget)) {
          toggle.dataset.dropdownToggle = 'closed';
          toggle.setAttribute('aria-expanded', 'false');
          dd.setAttribute('aria-hidden', 'true');
        }
      });
    });

    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        toggles.forEach(toggle => {
          toggle.dataset.dropdownToggle = 'closed';
          toggle.setAttribute('aria-expanded', 'false');
          const dd = toggle.nextElementSibling;
          if (dd) dd.setAttribute('aria-hidden', 'true');
        });
      });
    });

    document.addEventListener('click', e => {
      const inside = toggles.some(toggle => {
        const dd = toggle.nextElementSibling;
        return toggle.contains(e.target) || (dd && dd.contains(e.target));
      });
      if (!inside) {
        toggles.forEach(toggle => {
          toggle.dataset.dropdownToggle = 'closed';
          toggle.setAttribute('aria-expanded', 'false');
          const dd = toggle.nextElementSibling;
          if (dd) dd.setAttribute('aria-hidden', 'true');
        });
      }
    });
  }

  // Initialize Multilevel Navigation
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
  });


	/* Filter Button */
function initBasicFilterSetupMultiMatch() {
  const transitionDelay = 300;
  const groups = [...document.querySelectorAll('[data-filter-group]')];

  groups.forEach(group => {
    const buttons = [...group.querySelectorAll('[data-filter-target]')];
    const items = [...group.querySelectorAll('[data-filter-name]')];

    // collect names once (init only)
    items.forEach(item => {
      const cs = item.querySelectorAll('[data-filter-name-collect]');
      if (!cs.length) return;
      const seen = new Set(), out = [];
      cs.forEach(c => {
        const v = (c.getAttribute('data-filter-name-collect') || '').trim().toLowerCase();
        if (v && !seen.has(v)) { seen.add(v); out.push(v); }
      });
      if (out.length) item.setAttribute('data-filter-name', out.join(' '));
    });

    // cache tokens
    const itemTokens = new Map();
    items.forEach(el => {
      const tokens = ((el.getAttribute('data-filter-name') || '').trim().toLowerCase().split(/\s+/)).filter(Boolean);
      itemTokens.set(el, new Set(tokens));
    });

    // state helpers
    const setItemState = (el, on) => {
      const next = on ? 'active' : 'not-active';
      if (el.getAttribute('data-filter-status') !== next) {
        el.setAttribute('data-filter-status', next);
        el.setAttribute('aria-hidden', on ? 'false' : 'true');
      }
    };
    const setButtonState = (btn, on) => {
      const next = on ? 'active' : 'not-active';
      if (btn.getAttribute('data-filter-status') !== next) {
        btn.setAttribute('data-filter-status', next);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    };

    let activeTarget = null;
    const itemMatches = el => {
      if (!activeTarget || activeTarget === 'all') return true;
      return itemTokens.get(el).has(activeTarget);
    };

    const paint = rawTarget => {
      const target = (rawTarget || '').trim().toLowerCase();
      activeTarget = (!target || target === 'all') ? 'all' : target;

      items.forEach(el => {
        if (el._ft) clearTimeout(el._ft);
        const next = itemMatches(el);
        const cur = el.getAttribute('data-filter-status');
        if (cur === 'active' && transitionDelay > 0) {
          el.setAttribute('data-filter-status', 'transition-out');
          el._ft = setTimeout(() => { setItemState(el, next); el._ft = null; }, transitionDelay);
        } else if (transitionDelay > 0) {
          el._ft = setTimeout(() => { setItemState(el, next); el._ft = null; }, transitionDelay);
        } else {
          setItemState(el, next);
        }
      });

      buttons.forEach(btn => {
        const t = (btn.getAttribute('data-filter-target') || '').trim().toLowerCase();
        setButtonState(btn, (activeTarget === 'all' && t === 'all') || (t && t === activeTarget));
      });
    };

    group.addEventListener('click', e => {
      const btn = e.target.closest('[data-filter-target]');
      if (btn && group.contains(btn)) paint(btn.getAttribute('data-filter-target'));
    });
  });
}

// Initialize Basic Filter Setup (Multi Match)
document.addEventListener('DOMContentLoaded', () => {
  initBasicFilterSetupMultiMatch();
});

// ------ OSMO Table of content code
gsap.registerPlugin(ScrollTrigger);

function initTableOfContents() {
  document.querySelectorAll('[data-toc-wrap]').forEach(root => {
    const contentEl = root.querySelector('[data-toc-content]');
    const listEl = root.querySelector('[data-toc-list]');
    const templateLink = listEl?.querySelector('[data-toc-link]');
    if (!contentEl || !listEl || !templateLink) return;

    const levels = (root.getAttribute('data-toc-levels') || 'h2,h3').split(',').map(l => l.trim().toLowerCase()).filter(l => /^h[1-6]$/.test(l));
    const levelSelector = levels.join(', ');
    if (!levelSelector) return;

    const offset = parseInt(root.getAttribute('data-toc-offset')) || 50;
    const marker = '{skip}';

    const slugCounts = new Map();

    function slugify(text) {
      let slug = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (!slug) slug = 'section';

      const count = slugCounts.get(slug) || 0;
      slugCounts.set(slug, count + 1);
      return count === 0 ? slug : slug + '-' + (count + 1);
    }

    function stripMarker(el) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent.includes(marker)) {
          node.textContent = node.textContent.replace(marker, '').trim();
        }
      }
    }

    const allHeadings = Array.from(contentEl.querySelectorAll(levelSelector));
    const headings = [];

    allHeadings.forEach(heading => {
      if (heading.hasAttribute('data-toc-ignore')) return;
      if (heading.textContent.includes(marker)) {
        stripMarker(heading);
        return;
      }
      const text = heading.textContent.trim();
      if (!text) return;
      headings.push(heading);
    });

    if (!headings.length) return;
    
    headings.forEach(heading => {
      if (!heading.id) {
        heading.id = slugify(heading.textContent.trim());
      }
    });

    const tocLinks = [];

    headings.forEach(heading => {
      const clone = templateLink.cloneNode(true);
      const textTarget = clone.querySelector('[data-toc-text]') || clone;
      textTarget.textContent = heading.textContent.trim();

      clone.href = '#' + heading.id;
      clone.removeAttribute('data-toc-link');
      clone.setAttribute('data-toc-item', '');

      const level = heading.tagName.charAt(1);
      clone.setAttribute('data-toc-depth', level);

      listEl.appendChild(clone);
      tocLinks.push(clone);
    });

    listEl.querySelectorAll('[data-toc-link]').forEach(el => el.remove());

    // Active state tracking via ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      function setActive(index) {
        tocLinks.forEach(link => link.setAttribute('data-toc-status', ''));
        if (tocLinks[index]) tocLinks[index].setAttribute('data-toc-status', 'active');
      }

      headings.forEach((heading, i) => {
        const nextHeading = headings[i + 1];

        ScrollTrigger.create({
          trigger: heading,
          start: 'top ' + (offset + 1) + 'px',
          endTrigger: nextHeading || contentEl,
          end: nextHeading ? 'top ' + (offset + 1) + 'px' : 'bottom top',
          onToggle: self => {
            if (self.isActive) setActive(i);
          }
        });
      });

      if (window.scrollY <= headings[0].getBoundingClientRect().top + window.scrollY - offset) {
        setActive(0);
      }
    }

    // Click handler with smooth scroll
    listEl.addEventListener('click', e => {
      const link = e.target.closest('[data-toc-item]');
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();

      const id = link.getAttribute('href')?.slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      if (typeof lenis !== 'undefined' && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(target, { offset: -offset });
      } else {
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
}

// Initialze Table of Contents For Article
document.addEventListener('DOMContentLoaded', () => {
  initTableOfContents();
});

// Inertia based interaction
gsap.registerPlugin(InertiaPlugin);

function initMomentumBasedHover() {

  // If this device can’t hover with a fine pointer, stop here
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {return;}
  
  // Configuration (tweak these for feel)
  const xyMultiplier       = 30;  // multiplies pointer velocity for x/y movement
  const rotationMultiplier = 20;  // multiplies normalized torque for rotation speed
  const inertiaResistance  = 200; // higher = stops sooner

  // Pre-build clamp functions for performance
  const clampXY  = gsap.utils.clamp(-1080, 1080);
  const clampRot = gsap.utils.clamp(-60, 60);

  // Initialize each root container
  document.querySelectorAll('[data-momentum-hover-init]').forEach(root => {
    let prevX = 0, prevY = 0;
    let velX  = 0, velY  = 0;
    let rafId = null;

    // Track pointer velocity (throttled to RAF)
    root.addEventListener('mousemove', e => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        velX = e.clientX - prevX;
        velY = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;
        rafId = null;
      });
    });

    // Attach hover inertia to each child element
    root.querySelectorAll('[data-momentum-hover-element]').forEach(el => {
      el.addEventListener('mouseenter', e => {
        const target = el.querySelector('[data-momentum-hover-target]');
        if (!target) return;

        // Compute offset from center to pointer
        const { left, top, width, height } = target.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const offsetX = e.clientX - centerX;
        const offsetY = e.clientY - centerY;

        // Compute raw torque (px²/frame)
        const rawTorque = offsetX * velY - offsetY * velX;

        // Normalize torque so rotation ∝ pointer speed (deg/sec)
        const leverDist    = Math.hypot(offsetX, offsetY) || 1;
        const angularForce = rawTorque / leverDist;

        // Calculate and clamp velocities
        const velocityX        = clampXY(velX * xyMultiplier);
        const velocityY        = clampXY(velY * xyMultiplier);
        const rotationVelocity = clampRot(angularForce * rotationMultiplier);

        // Apply GSAP inertia tween
        gsap.to(target, {
          inertia: {
            x:        { velocity: velocityX,        end: 0 },
            y:        { velocity: velocityY,        end: 0 },
            rotation: { velocity: rotationVelocity, end: 0 },
            resistance: inertiaResistance
          }
        });
      });
    });
  });
}

// Initialize Momentum Based Hover (Inertia)
document.addEventListener("DOMContentLoaded", () => {
  initMomentumBasedHover();
});


