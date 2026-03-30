/**
 * CropFit Planner — App State Manager
 * ========================================
 * In-memory application state. No browser storage APIs used.
 * All state lives here and is passed to rendering functions.
 *
 * State shape:
 * {
 *   view:       string   — current view: 'planner' | 'results' | 'compare' | 'library' | 'methodology'
 *   inputs:     object   — current form inputs (see planner form)
 *   results:    array    — scored crop results (from scoreAllCrops)
 *   sortMode:   string   — current sort mode for results
 *   compareIds: Set      — set of crop IDs selected for comparison
 *   loading:    boolean  — loading state for async ops
 * }
 */

export const State = {
  view: 'planner',
  inputs: {
    region: '',
    regionLabel: '',
    lat: null,
    lng: null,
    locationText: '',
    season: '',
    duration_type: '',
    water_access: '',
    soil_type: '',
    management: '',
    market: '',
    farm_scale: '',
    // Optional advanced
    frost_risk: '',
    wind_exposure: '',
    drainage: '',
    time_to_income: ''
  },
  results: [],
  sortMode: 'suitability',
  compareIds: new Set(),
  loading: false,
  hasResults: false
};

/** Update a slice of state and re-render if provided */
export function setState(patch, renderFn) {
  Object.assign(State, patch);
  if (renderFn) renderFn();
}

/** Navigate to a view and optionally scroll to top */
export function navigate(view) {
  State.view = view;
  // Update URL hash for bookmarking / back-button support
  window.location.hash = '#' + view;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Toggle a crop in the compare set (max 3) */
export function toggleCompare(cropId) {
  if (State.compareIds.has(cropId)) {
    State.compareIds.delete(cropId);
    return true;
  }
  if (State.compareIds.size >= 3) {
    return false; // Max 3 reached
  }
  State.compareIds.add(cropId);
  return true;
}

/** Reset inputs and results */
export function resetPlanner() {
  Object.assign(State.inputs, {
    region: '', regionLabel: '', lat: null, lng: null, locationText: '',
    season: '', duration_type: '', water_access: '',
    soil_type: '', management: '', market: '', farm_scale: '',
    frost_risk: '', wind_exposure: '', drainage: '', time_to_income: ''
  });
  State.results = [];
  State.hasResults = false;
  State.compareIds = new Set();
}

/** Get hash-based initial view */
export function getInitialView() {
  const hash = window.location.hash.replace('#', '');
  const valid = ['planner', 'results', 'compare', 'library', 'methodology'];
  return valid.includes(hash) ? hash : 'planner';
}
