/**
 * CropFit Planner — Form Handler
 * ===============================
 * Handles all form events:
 * - Radio card selections
 * - Geolocation detection
 * - Form submission and validation
 * - Reset
 */

import { State, navigate, resetPlanner } from './state.js';
import { CROPS, detectRegionFromCoords, REGION_ARCHETYPES } from './cropData.js';
import { scoreAllCrops } from './scoringEngine.js';
import { render } from './render.js';

// ─────────────────────────────────────────────────────────────────────────────
// ATTACH FORM HANDLERS — called after planner view is rendered
// ─────────────────────────────────────────────────────────────────────────────
export function attachFormHandlers() {
  const form = document.getElementById('planner-form');
  if (!form) return;

  // ── Radio card selections ─────────────────────────────────────────────
  form.querySelectorAll('.radio-input').forEach(input => {
    input.addEventListener('change', () => {
      handleRadioChange(input);
    });
  });

  // Visual update for radio cards on click of the label itself
  form.querySelectorAll('.radio-card').forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('.radio-input');
      if (!radio) return;
      // Visual state handled via CSS :has(input:checked) — but also update aria
    });
  });

  // ── Free text inputs ──────────────────────────────────────────────────
  const locationTextInput = document.getElementById('location-text');
  if (locationTextInput) {
    locationTextInput.addEventListener('input', () => {
      State.inputs.locationText = locationTextInput.value;
    });
  }

  const latInput = document.getElementById('lat-input');
  const lngInput = document.getElementById('lng-input');
  if (latInput && lngInput) {
    const onCoordChange = () => {
      const lat = parseFloat(latInput.value);
      const lng = parseFloat(lngInput.value);
      if (!isNaN(lat) && !isNaN(lng)) {
        State.inputs.lat = lat;
        State.inputs.lng = lng;
        const detectedRegion = detectRegionFromCoords(lat, lng);
        selectRegion(detectedRegion);
        updateGeoStatus(`Region auto-detected: ${REGION_ARCHETYPES[detectedRegion]?.label}`, 'success');
      }
    };
    latInput.addEventListener('change', onCoordChange);
    lngInput.addEventListener('change', onCoordChange);
  }

  // ── Geolocation button ────────────────────────────────────────────────
  const geoBtn = document.getElementById('detect-location-btn');
  if (geoBtn) {
    geoBtn.addEventListener('click', handleGeoDetect);
  }

  // ── Form submission ────────────────────────────────────────────────────
  form.addEventListener('submit', handleFormSubmit);

  // ── Reset button ───────────────────────────────────────────────────────
  const resetBtn = document.getElementById('reset-form-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetPlanner();
      render();
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RADIO CHANGE HANDLER
// ─────────────────────────────────────────────────────────────────────────────
function handleRadioChange(input) {
  const name = input.name;
  const value = input.value;

  // Update state
  if (name === 'region') {
    State.inputs.region = value;
    State.inputs.regionLabel = REGION_ARCHETYPES[value]?.label || value;
  } else {
    State.inputs[name] = value;
  }

  // Update visual state of radio cards
  const group = input.closest('[role="radiogroup"]');
  if (group) {
    group.querySelectorAll('.radio-card').forEach(card => {
      const cardInput = card.querySelector('.radio-input');
      if (cardInput) {
        card.classList.toggle('radio-card--selected', cardInput.checked);
      }
    });
  }

  // Clear form error if present
  clearFormError();
}

// ─────────────────────────────────────────────────────────────────────────────
// GEOLOCATION HANDLER
// ─────────────────────────────────────────────────────────────────────────────
function handleGeoDetect() {
  if (!navigator.geolocation) {
    updateGeoStatus('Geolocation is not supported by your browser. Enter coordinates manually.', 'error');
    return;
  }

  updateGeoStatus('Detecting location...', 'loading');
  const btn = document.getElementById('detect-location-btn');
  if (btn) btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      State.inputs.lat = lat;
      State.inputs.lng = lng;

      // Auto-detect region
      const detectedRegion = detectRegionFromCoords(lat, lng);
      State.inputs.region = detectedRegion;
      State.inputs.regionLabel = REGION_ARCHETYPES[detectedRegion]?.label || detectedRegion;

      // Update coordinate inputs if visible
      const latInput = document.getElementById('lat-input');
      const lngInput = document.getElementById('lng-input');
      if (latInput) latInput.value = lat.toFixed(4);
      if (lngInput) lngInput.value = lng.toFixed(4);

      // Update radio card visual state
      selectRegion(detectedRegion);
      updateGeoStatus(`Location detected — ${REGION_ARCHETYPES[detectedRegion]?.label || detectedRegion}`, 'success');

      if (btn) btn.disabled = false;
    },
    (error) => {
      let msg = 'Could not detect location. ';
      switch (error.code) {
        case error.PERMISSION_DENIED:  msg += 'Location access denied by browser.'; break;
        case error.POSITION_UNAVAILABLE: msg += 'Location unavailable.'; break;
        case error.TIMEOUT: msg += 'Request timed out.'; break;
        default: msg += 'Unknown error.';
      }
      updateGeoStatus(msg, 'error');
      if (btn) btn.disabled = false;
    },
    { timeout: 8000, enableHighAccuracy: false }
  );
}

function selectRegion(regionKey) {
  // Programmatically select the matching region radio card
  const radios = document.querySelectorAll('input[name="region"]');
  radios.forEach(r => {
    r.checked = r.value === regionKey;
    const card = r.closest('.radio-card');
    if (card) card.classList.toggle('radio-card--selected', r.checked);
  });
}

function updateGeoStatus(msg, type) {
  const el = document.getElementById('geo-status');
  if (!el) return;
  el.textContent = msg;
  el.className = `geo-status geo-status--${type}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
const REQUIRED_FIELDS = [
  { key: 'region',        label: 'Region archetype (Section A)' },
  { key: 'season',        label: 'Planting season (Section B)' },
  { key: 'duration_type', label: 'Crop duration type (Section C)' },
  { key: 'water_access',  label: 'Water access (Section D)' },
  { key: 'management',    label: 'Management intensity (Section F)' },
  { key: 'market',        label: 'Target market (Section G)' },
  { key: 'farm_scale',    label: 'Farm scale (Section H)' }
];

function validateForm() {
  const missing = REQUIRED_FIELDS.filter(f => !State.inputs[f.key]);
  return missing;
}

function showFormError(missing) {
  const el = document.getElementById('form-error');
  if (!el) return;
  el.hidden = false;
  el.innerHTML = `<strong>Please complete the following required fields:</strong><ul>${
    missing.map(f => `<li>${f.label}</li>`).join('')
  }</ul>`;
}

function clearFormError() {
  const el = document.getElementById('form-error');
  if (el) el.hidden = true;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM SUBMIT — Runs scoring and navigates to results
// ─────────────────────────────────────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();

  const missing = validateForm();
  if (missing.length > 0) {
    showFormError(missing);
    // Scroll to first error
    const errorEl = document.getElementById('form-error');
    if (errorEl) errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  clearFormError();

  // Show loading state on button
  const btn = document.getElementById('run-analysis-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span> Analysing crops...`;
  }

  // Small timeout to allow the loading state to render
  setTimeout(() => {
    try {
      const results = scoreAllCrops(CROPS, State.inputs);
      State.results = results;
      State.hasResults = true;
      State.sortMode = 'suitability';
      State.compareIds = new Set();
      navigate('results');
      render();
    } catch (err) {
      console.error('Scoring error:', err);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Run Crop Analysis <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      }
      const errorEl = document.getElementById('form-error');
      if (errorEl) {
        errorEl.hidden = false;
        errorEl.textContent = 'An error occurred while analysing crops. Please try again.';
      }
    }
  }, 150);
}
