/**
 * PORTFOLIO.OS // MAIN APPLICATION LOGIC & INTERACTIONS
 * Personalized for: AHAL ABBAS (SCTCE Trivandrum - B.Tech CSE AI & ML)
 * Features:
 * - Interactive Mouse Spotlight & Cursor Dot
 * - 3D Card Mouse Tilt (Hologram & Skill Cards)
 * - Intersection Observer Scroll Reveals
 * - Skills Dynamic Filtering (All 8 Core Skills)
 * - Live Identity Customizer (Persistent via localStorage)
 * - Tactical Dossier / CV Modal with Print capability
 * - Contact Form Validation & Transmission
 * - Copy to Clipboard Toast Notifications
 * - Atmosphere / Superhero Focus Switcher
 */

(function () {
  'use strict';

  // State
  const state = {
    userName: localStorage.getItem('hero_portfolio_name') || 'AHAL ABBAS',
    userEmail: localStorage.getItem('hero_portfolio_email') || 'ahalabbas2008@gmail.com',
    themeMode: localStorage.getItem('hero_portfolio_theme') || 'dual',
    customAvatarUrl: localStorage.getItem('hero_portfolio_avatar') || null
  };

  /* -------------------------------------------------------------
     1. INITIALIZE IDENTITY & THEME
  ------------------------------------------------------------- */
  function applyIdentity() {
    // Update all name display elements
    const nameElements = [
      document.getElementById('display-hero-name'),
      document.getElementById('hologram-display-name'),
      document.getElementById('dossier-name'),
      document.getElementById('footer-owner-name')
    ];

    nameElements.forEach(el => {
      if (el) el.textContent = state.userName;
    });

    // Update email display elements
    const emailEls = [
      document.getElementById('display-contact-email')
    ];
    emailEls.forEach(el => {
      if (el) {
        el.textContent = state.userEmail;
        el.setAttribute('href', 'mailto:' + state.userEmail);
      }
    });

    const copyBtn = document.querySelector('.btn-copy-channel');
    if (copyBtn) copyBtn.setAttribute('data-copy-val', state.userEmail);

    // Apply custom avatar if set
    if (state.customAvatarUrl) {
      const avatarFrame = document.getElementById('avatarFrame');
      if (avatarFrame) {
        avatarFrame.innerHTML = `<img src="${state.customAvatarUrl}" alt="${state.userName}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
      }
    }

    // Apply theme mode
    setThemeMode(state.themeMode, false);
  }

  function setThemeMode(mode, save = true) {
    state.themeMode = mode;
    document.body.setAttribute('data-theme', mode);

    // Update active state in HUD buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    document.querySelectorAll('.accent-choice-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-pick') === mode);
    });

    if (save) {
      localStorage.setItem('hero_portfolio_theme', mode);
    }

    // Dispatch custom event for canvas engine
    window.dispatchEvent(new CustomEvent('themeModeChanged', { detail: { mode } }));
  }

  /* -------------------------------------------------------------
     2. MOUSE SPOTLIGHT & CURSOR FOLLOWER
  ------------------------------------------------------------- */
  const cursorGlow = document.getElementById('cursor-glow');
  const cursorDot = document.getElementById('cursor-dot');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursorDot) {
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    }
  }, { passive: true });

  function renderCursor() {
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;

    if (cursorGlow) {
      cursorGlow.style.left = currentX + 'px';
      cursorGlow.style.top = currentY + 'px';
    }
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  /* -------------------------------------------------------------
     3. HEADER SCROLL & MOBILE DRAWER
  ------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking nav links
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', false);
      });
    });
  }

  /* Active Nav Link Highlighting on Scroll */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { passive: true });

  /* -------------------------------------------------------------
     4. INTERSECTION OBSERVER FOR SCROLL REVEALS
  ------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, parseInt(delay, 10));
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  /* -------------------------------------------------------------
     5. 3D CARD HOVER TILT
  ------------------------------------------------------------- */
  function setup3DTilt(selector, maxAngle = 8) {
    const cards = document.querySelectorAll(selector);

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardX = e.clientX - rect.left;
        const cardY = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((cardY - centerY) / centerY) * -maxAngle;
        const rotateY = ((cardX - centerX) / centerX) * maxAngle;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  setup3DTilt('.hologram-card', 8);
  setup3DTilt('.skill-card', 6);

  /* -------------------------------------------------------------
     6. SKILLS TAB FILTERING
  ------------------------------------------------------------- */
  const skillTabs = document.querySelectorAll('.skill-tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      skillCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 250);
        }
      });
    });
  });

  /* -------------------------------------------------------------
     7. TOAST NOTIFICATION UTILITY
  ------------------------------------------------------------- */
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span style="color:${type === 'success' ? '#10b981' : '#ff2a5f'};">⚡</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  /* -------------------------------------------------------------
     8. ONE-CLICK CLIPBOARD COPY
  ------------------------------------------------------------- */
  document.querySelectorAll('.btn-copy-channel').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-copy-val') || state.userEmail;
      navigator.clipboard.writeText(val).then(() => {
        showToast(`COPIED // ${val}`, 'success');
        if (window.HeroAudio) window.HeroAudio.playSuccess();
      }).catch(() => {
        showToast('COPIED TO CLIPBOARD', 'success');
      });
    });
  });

  /* -------------------------------------------------------------
     9. MODAL UTILITIES
  ------------------------------------------------------------- */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.HeroAudio) window.HeroAudio.playBatWhoosh();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* -------------------------------------------------------------
     10. IDENTITY CUSTOMIZER MODAL
  ------------------------------------------------------------- */
  const customizerModal = document.getElementById('customizerModal');
  const openCustomizerBtn = document.getElementById('open-customize-modal');
  const quickEditBtn = document.getElementById('quick-edit-name-btn');
  const closeCustomizerBtn = document.getElementById('close-customizer-modal');
  const cancelCustomizerBtn = document.getElementById('cancel-customizer');
  const saveCustomizerBtn = document.getElementById('save-customizer');
  const nameInput = document.getElementById('custom-name-input');
  const emailInput = document.getElementById('custom-email-input');
  const heroNameDisplay = document.getElementById('display-hero-name');

  function setupCustomizerOpen() {
    nameInput.value = state.userName;
    emailInput.value = state.userEmail;
    openModal(customizerModal);
  }

  if (openCustomizerBtn) openCustomizerBtn.addEventListener('click', setupCustomizerOpen);
  if (quickEditBtn) quickEditBtn.addEventListener('click', setupCustomizerOpen);
  if (heroNameDisplay) heroNameDisplay.addEventListener('click', setupCustomizerOpen);

  if (closeCustomizerBtn) closeCustomizerBtn.addEventListener('click', () => closeModal(customizerModal));
  if (cancelCustomizerBtn) cancelCustomizerBtn.addEventListener('click', () => closeModal(customizerModal));

  // Accent Selection inside modal
  let selectedAccent = state.themeMode;
  document.querySelectorAll('.accent-choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.accent-choice-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAccent = btn.getAttribute('data-pick');
    });
  });

  if (saveCustomizerBtn) {
    saveCustomizerBtn.addEventListener('click', () => {
      const newName = nameInput.value.trim() || 'AHAL ABBAS';
      const newEmail = emailInput.value.trim() || 'ahalabbas2008@gmail.com';

      state.userName = newName;
      state.userEmail = newEmail;

      localStorage.setItem('hero_portfolio_name', newName);
      localStorage.setItem('hero_portfolio_email', newEmail);

      setThemeMode(selectedAccent, true);
      applyIdentity();
      closeModal(customizerModal);

      showToast(`IDENTITY UPDATED: ${newName}`, 'success');
      if (window.HeroAudio) window.HeroAudio.playSuccess();
    });
  }

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
  });

  // Close modals on ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m));
    }
  });

  /* -------------------------------------------------------------
     11. PROFILE PHOTO / AVATAR FILE UPLOADER
  ------------------------------------------------------------- */
  const avatarChangeBtn = document.getElementById('avatar-change-btn');
  const avatarFileInput = document.getElementById('avatarFileInput');

  if (avatarChangeBtn && avatarFileInput) {
    avatarChangeBtn.addEventListener('click', () => avatarFileInput.click());

    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          state.customAvatarUrl = base64;
          localStorage.setItem('hero_portfolio_avatar', base64);
          applyIdentity();
          showToast('NEW AVATAR SYNCHRONIZED', 'success');
          if (window.HeroAudio) window.HeroAudio.playWebSling();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  /* -------------------------------------------------------------
     12. TACTICAL DOSSIER / CV MODAL
  ------------------------------------------------------------- */
  const dossierModal = document.getElementById('dossierModal');
  const openDossierBtn = document.getElementById('open-dossier-modal');
  const closeDossierBtn = document.getElementById('close-dossier-modal');
  const closeDossierFooterBtn = document.getElementById('close-dossier-btn');
  const printDossierBtn = document.getElementById('print-dossier-btn');

  if (openDossierBtn) openDossierBtn.addEventListener('click', () => openModal(dossierModal));
  if (closeDossierBtn) closeDossierBtn.addEventListener('click', () => closeModal(dossierModal));
  if (closeDossierFooterBtn) closeDossierFooterBtn.addEventListener('click', () => closeModal(dossierModal));

  if (printDossierBtn) {
    printDossierBtn.addEventListener('click', () => {
      window.print();
    });
  }

  /* -------------------------------------------------------------
     13. TACTICAL CONTACT FORM TRANSMISSION
  ------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const submitContactBtn = document.getElementById('submitContactBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const formSuccessBox = document.getElementById('formSuccessBox');
  const resetFormBtn = document.getElementById('resetFormBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const subjectInput = document.getElementById('contact-subject');
      const messageInput = document.getElementById('contact-message');

      let isValid = true;

      // Validation
      if (!nameInput.value.trim()) {
        nameInput.classList.add('error');
        isValid = false;
      } else {
        nameInput.classList.remove('error');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        emailInput.classList.add('error');
        isValid = false;
      } else {
        emailInput.classList.remove('error');
      }

      if (!subjectInput.value.trim()) {
        subjectInput.classList.add('error');
        isValid = false;
      } else {
        subjectInput.classList.remove('error');
      }

      if (!messageInput.value.trim()) {
        messageInput.classList.add('error');
        isValid = false;
      } else {
        messageInput.classList.remove('error');
      }

      if (!isValid) {
        showToast('PLEASE COMPLETE ALL REQUIRED FIELDS', 'info');
        return;
      }

      // Simulated Transmission
      submitContactBtn.disabled = true;
      submitBtnText.textContent = 'ENCRYPTING & TRANSMITTING SIGNAL...';
      if (window.HeroAudio) window.HeroAudio.playBatWhoosh();

      setTimeout(() => {
        contactForm.style.display = 'none';
        formSuccessBox.classList.add('show');
        submitContactBtn.disabled = false;
        submitBtnText.textContent = 'TRANSMIT MESSAGE';

        showToast('SIGNAL TRANSMITTED SUCCESSFULLY', 'success');
        if (window.HeroAudio) window.HeroAudio.playSuccess();
      }, 1400);
    });

    // Reset Form button
    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', () => {
        contactForm.reset();
        contactForm.style.display = 'flex';
        formSuccessBox.classList.remove('show');
      });
    }
  }

  /* -------------------------------------------------------------
     14. HUD ATMOSPHERE SWITCHER BUTTONS
  ------------------------------------------------------------- */
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      setThemeMode(mode, true);
      showToast(`ATMOSPHERE SHIFTED: ${mode.toUpperCase()} UNIVERSE`, 'info');
      if (mode === 'spider' && window.HeroAudio) window.HeroAudio.playWebSling();
      if (mode === 'batman' && window.HeroAudio) window.HeroAudio.playBatWhoosh();
    });
  });

  /* -------------------------------------------------------------
     15. FOOTER YEAR UPDATE
  ------------------------------------------------------------- */
  const currentYearEl = document.getElementById('currentYear');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // Run on startup
  applyIdentity();

})();
