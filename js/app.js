/**
 * CropFit Planner — Main App Entry Point
 * ==========================================
 *
 * README / ARCHITECTURE NOTES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * MODULE OVERVIEW:
 *   app.js           — Entry point, nav, theme, global render cycle
 *   state.js         — In-memory app state, navigation helpers
 *   cropData.js      — Crop dataset (30 crops) and region archetype definitions
 *   scoringEngine.js — Rule-based scoring logic, sort helpers, score bands
 *   render.js        — All DOM rendering (produces HTML strings)
 *   formHandler.js   — Form event handling, validation, geolocation
 *
 * HOW TO ADD A NEW CROP:
 *   1. Open js/cropData.js
 *   2. Add a new object to the CROPS array following the field guide at the top
 *   3. All enum values must match the defined sets
 *   4. No other changes needed — scoring and rendering auto-handle new crops
 *
 * HOW TO ADJUST SCORING WEIGHTS:
 *   Open js/scoringEngine.js → find the WEIGHTS constant → edit values
 *   Higher number = greater influence on final score
 *
 * HOW TO CHANGE SCORE BANDS:
 *   Open js/scoringEngine.js → find SCORE_BANDS → adjust min values
 *
 * FUTURE API INTEGRATION POINTS:
 *   - Weather/GIS region detect: Replace detectRegionFromCoords() in cropData.js
 *   - Market prices: Add priceData.js, reference in render.js crop card renderer
 *   - Soil lookup: Create soilLookup.js, query from user lat/lng, pre-fill form
 *   - User accounts/saved analyses: Replace State with backend API calls
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { State, navigate, getInitialView } from './state.js';
import { render } from './render.js';
import { attachFormHandlers } from './formHandler.js';

// Make renderAndAttach available globally for inline handlers
window.CropFit = { renderAndAttach };

// ─────────────────────────────────────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNav();
  initHashRouting();

  // Set initial view from URL hash
  State.view = getInitialView();
  renderAndAttach();
});

// ─────────────────────────────────────────────────────────────────────────────
// RENDER + ATTACH CYCLE
// Every view change calls this to render HTML then attach event handlers.
// ─────────────────────────────────────────────────────────────────────────────
export function renderAndAttach() {
  render();
  if (State.view === 'planner') {
    attachFormHandlers();
  }
  updateNavHighlight();
}

function updateNavHighlight() {
  document.querySelectorAll('#app-nav [data-nav]').forEach(btn => {
    const isActive = btn.dataset.nav === State.view;
    btn.classList.toggle('nav-btn--active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// THEME TOGGLE
// ─────────────────────────────────────────────────────────────────────────────
function initTheme() {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let currentTheme = prefersDark ? 'dark' : 'light';
  root.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    btn.setAttribute('aria-label', `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`);
  });
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.innerHTML = theme === 'dark'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('app-nav');
  if (nav) {
    nav.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-nav]');
      if (!btn) return;
      e.preventDefault();
      navigate(btn.dataset.nav);
      renderAndAttach();
    });
  }

  const logoLink = document.getElementById('logo-link');
  if (logoLink) {
    logoLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('planner');
      renderAndAttach();
    });
  }
}

function initHashRouting() {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    const valid = ['planner', 'results', 'compare', 'library', 'methodology'];
    if (valid.includes(hash) && hash !== State.view) {
      State.view = hash;
      renderAndAttach();
    }
  });
}
