/**
 * CropFit Planner — Render Module
 * =====================================
 * All DOM rendering is handled here.
 * Functions receive state and produce HTML strings or mutate DOM elements.
 *
 * Pattern: Each render function returns an HTML string.
 * The main render() function routes to the correct view renderer.
 *
 * FUTURE API INTEGRATION NOTE:
 * When a backend is added, replace the local scoreAllCrops() call in
 * renderResults() with an async fetch to your API endpoint.
 * The result shape should match the current { crop, score, band, reasons, warnings } format.
 */

import { State, navigate, toggleCompare } from './state.js';
import { CROPS, REGION_ARCHETYPES } from './cropData.js';
import {
  scoreAllCrops, sortResults, getBand,
  formatDuration, formatMarket, formatSoil, formatScale,
  formatWater, formatManagement, formatTimeToIncome,
  SCORE_BANDS
} from './scoringEngine.js';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RENDER DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────
export function render() {
  const main = document.getElementById('app-main');
  if (!main) return;

  switch (State.view) {
    case 'planner':     main.innerHTML = renderPlannerView(); break;
    case 'results':     main.innerHTML = renderResultsView(); break;
    case 'compare':     main.innerHTML = renderCompareView(); break;
    case 'library':     main.innerHTML = renderLibraryView(); break;
    case 'methodology': main.innerHTML = renderMethodologyView(); break;
    default:            main.innerHTML = renderPlannerView();
  }

  updateNavActive();
  attachViewHandlers();
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANNER VIEW
// ─────────────────────────────────────────────────────────────────────────────
function renderPlannerView() {
  const inp = State.inputs;

  return `
  <div class="view-planner">
    <div class="view-header">
      <h1 class="view-title">Planner</h1>
      <p class="view-subtitle">Complete the fields below to generate crop suitability recommendations for your farm.</p>
    </div>

    <form id="planner-form" class="planner-form" novalidate>

      <!-- SECTION A: Location -->
      <fieldset class="form-section">
        <legend class="section-label">
          <span class="section-num">A</span>
          Location
        </legend>
        <div class="section-body">
          <div class="field-group">
            <label class="field-label" for="location-text">Farm region or area name</label>
            <input
              type="text"
              id="location-text"
              name="locationText"
              class="field-input"
              placeholder="e.g. Tzaneen, KZN Midlands, Citrusdal"
              value="${escHtml(inp.locationText)}"
            >
          </div>

          <div class="field-group">
            <label class="field-label">Region archetype</label>
            <p class="field-hint">Select the climate region that best describes your farm. Use the geolocation button to auto-detect from GPS, or choose manually.</p>
            <div class="geo-row">
              <button type="button" id="detect-location-btn" class="btn-geo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="M12 5a7 7 0 0 1 7 7M5 12a7 7 0 0 1 7-7"/></svg>
                Detect my location
              </button>
              <span class="geo-status" id="geo-status" aria-live="polite"></span>
            </div>
            <div class="radio-grid" role="radiogroup" aria-label="Region archetype">
              ${renderRegionOptions(inp.region)}
            </div>
          </div>

          <div class="field-group coord-group" id="coord-group">
            <label class="field-label">Coordinates (optional)</label>
            <div class="coord-row">
              <input type="number" id="lat-input" name="lat" class="field-input coord-input" placeholder="Latitude (e.g. -29.8)" step="0.0001" value="${inp.lat ?? ''}">
              <input type="number" id="lng-input" name="lng" class="field-input coord-input" placeholder="Longitude (e.g. 30.9)" step="0.0001" value="${inp.lng ?? ''}">
            </div>
          </div>
        </div>
      </fieldset>

      <!-- SECTION B: Planting Window -->
      <fieldset class="form-section">
        <legend class="section-label">
          <span class="section-num">B</span>
          Planting Window
        </legend>
        <div class="section-body">
          <div class="field-group">
            <label class="field-label">When do you intend to plant?</label>
            <p class="field-hint">Based on the South African seasonal calendar.</p>
            <div class="radio-grid radio-grid--2" role="radiogroup" aria-label="Planting season">
              ${renderRadioCards('season', [
                { value: 'summer', label: 'Summer', sub: 'Oct – Feb' },
                { value: 'autumn', label: 'Autumn', sub: 'Mar – May' },
                { value: 'winter', label: 'Winter', sub: 'Jun – Aug' },
                { value: 'spring', label: 'Spring', sub: 'Sep – Nov' }
              ], inp.season)}
            </div>
          </div>
        </div>
      </fieldset>

      <!-- SECTION C: Crop Duration -->
      <fieldset class="form-section">
        <legend class="section-label">
          <span class="section-num">C</span>
          Crop Duration
        </legend>
        <div class="section-body">
          <div class="field-group">
            <label class="field-label">What type of crop are you looking for?</label>
            <div class="radio-grid radio-grid--3" role="radiogroup" aria-label="Crop duration type">
              ${renderRadioCards('duration_type', [
                { value: 'annual', label: 'Annual / Seasonal', sub: 'Single growing cycle' },
                { value: 'short-perennial', label: 'Short Perennial', sub: 'Produces 2–8 years' },
                { value: 'long-perennial', label: 'Long Perennial / Orchard', sub: 'Produces 10+ years' }
              ], inp.duration_type)}
            </div>
          </div>
        </div>
      </fieldset>

      <!-- SECTION D: Water Access -->
      <fieldset class="form-section">
        <legend class="section-label">
          <span class="section-num">D</span>
          Water Access
        </legend>
        <div class="section-body">
          <div class="field-group">
            <label class="field-label">What is your water situation?</label>
            <div class="radio-grid radio-grid--3" role="radiogroup" aria-label="Water access">
              ${renderRadioCards('water_access', [
                { value: 'rainfed', label: 'Rainfed Only', sub: 'No irrigation available' },
                { value: 'limited', label: 'Limited Irrigation', sub: 'Supplemental / seasonal' },
                { value: 'reliable', label: 'Reliable Irrigation', sub: 'Year-round supply' }
              ], inp.water_access)}
            </div>
          </div>
        </div>
      </fieldset>

      <!-- SECTION E: Soil Type -->
      <fieldset class="form-section">
        <legend class="section-label">
          <span class="section-num">E</span>
          Soil Type <span class="optional-tag">Optional</span>
        </legend>
        <div class="section-body">
          <div class="field-group">
            <label class="field-label">What is the dominant soil type on your farm?</label>
            <p class="field-hint">Selecting "I don't know" will not penalise your results, but may lower confidence indicators.</p>
            <div class="radio-grid radio-grid--3" role="radiogroup" aria-label="Soil type">
              ${renderRadioCards('soil_type', [
                { value: 'sandy', label: 'Sandy', sub: 'Drains fast, low fertility' },
                { value: 'sandy-loam', label: 'Sandy Loam', sub: 'Well-drained, workable' },
                { value: 'loam', label: 'Loam', sub: 'Balanced texture, fertile' },
                { value: 'clay-loam', label: 'Clay Loam', sub: 'Moderate drainage' },
                { value: 'clay', label: 'Clay', sub: 'Dense, holds moisture' },
                { value: 'shallow-rocky', label: 'Shallow / Rocky', sub: 'Limited rooting depth' },
                { value: 'unknown', label: "I don't know", sub: 'Skips soil scoring' }
              ], inp.soil_type)}
            </div>
          </div>
        </div>
      </fieldset>

      <!-- SECTION F: Management -->
      <fieldset class="form-section">
        <legend class="section-label">
          <span class="section-num">F</span>
          Management Intensity
        </legend>
        <div class="section-body">
          <div class="field-group">
            <label class="field-label">How much management can you commit to?</label>
            <div class="radio-grid radio-grid--3" role="radiogroup" aria-label="Management intensity">
              ${renderRadioCards('management', [
                { value: 'low', label: 'Low Maintenance', sub: 'Minimal inputs & labour' },
                { value: 'moderate', label: 'Moderate', sub: 'Regular inputs & attention' },
                { value: 'high', label: 'High Management', sub: 'Intensive inputs & labour' }
              ], inp.management)}
            </div>
          </div>
        </div>
      </fieldset>

      <!-- SECTION G: Market -->
      <fieldset class="form-section">
        <legend class="section-label">
          <span class="section-num">G</span>
          Target Market
        </legend>
        <div class="section-body">
          <div class="field-group">
            <label class="field-label">Where do you plan to sell?</label>
            <div class="radio-grid radio-grid--2" role="radiogroup" aria-label="Target market">
              ${renderRadioCards('market', [
                { value: 'fresh-local', label: 'Fresh Local Sales', sub: 'Urban fresh produce buyers' },
                { value: 'farmgate', label: 'Informal / Farmgate', sub: 'Direct on-farm sales' },
                { value: 'processor', label: 'Processor / Factory', sub: 'Contract processing' },
                { value: 'supermarket', label: 'Supermarket Program', sub: 'Formal retail supply' },
                { value: 'export', label: 'Export', sub: 'International markets' }
              ], inp.market)}
            </div>
          </div>
        </div>
      </fieldset>

      <!-- SECTION H: Farm Scale -->
      <fieldset class="form-section">
        <legend class="section-label">
          <span class="section-num">H</span>
          Farm Scale
        </legend>
        <div class="section-body">
          <div class="field-group">
            <label class="field-label">What is the intended planting area?</label>
            <div class="radio-grid radio-grid--2" role="radiogroup" aria-label="Farm scale">
              ${renderRadioCards('farm_scale', [
                { value: 'micro', label: 'Under 2 ha', sub: 'Micro / homestead' },
                { value: 'small', label: '2–10 ha', sub: 'Small-scale farm' },
                { value: 'medium', label: '10–50 ha', sub: 'Medium commercial' },
                { value: 'large', label: '50+ ha', sub: 'Large commercial' }
              ], inp.farm_scale)}
            </div>
          </div>
        </div>
      </fieldset>

      <!-- SECTION I: Advanced Filters (collapsible) -->
      <fieldset class="form-section form-section--advanced">
        <legend class="section-label section-label--toggle" id="advanced-toggle" role="button" tabindex="0" aria-expanded="false" aria-controls="advanced-body">
          <span class="section-num">I</span>
          Advanced Filters
          <span class="optional-tag">Optional</span>
          <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </legend>
        <div class="section-body advanced-body" id="advanced-body" hidden>

          <div class="field-group">
            <label class="field-label">Frost risk at your site</label>
            <div class="radio-grid radio-grid--3" role="radiogroup" aria-label="Frost risk">
              ${renderRadioCards('frost_risk', [
                { value: 'low', label: 'Low', sub: 'Rarely freezes' },
                { value: 'medium', label: 'Medium', sub: 'Occasional light frost' },
                { value: 'high', label: 'High', sub: 'Regular severe frost' }
              ], inp.frost_risk)}
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Wind exposure</label>
            <div class="radio-grid radio-grid--3" role="radiogroup" aria-label="Wind exposure">
              ${renderRadioCards('wind_exposure', [
                { value: 'low', label: 'Sheltered', sub: 'Protected from wind' },
                { value: 'medium', label: 'Moderate', sub: 'Some wind exposure' },
                { value: 'high', label: 'Exposed', sub: 'Frequent strong winds' }
              ], inp.wind_exposure)}
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Soil drainage</label>
            <div class="radio-grid radio-grid--3" role="radiogroup" aria-label="Soil drainage">
              ${renderRadioCards('drainage', [
                { value: 'poor', label: 'Poor', sub: 'Waterlogging common' },
                { value: 'moderate', label: 'Moderate', sub: 'Drains reasonably' },
                { value: 'good', label: 'Good', sub: 'Drains freely' }
              ], inp.drainage)}
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Time to first income</label>
            <div class="radio-grid radio-grid--3" role="radiogroup" aria-label="Time to income">
              ${renderRadioCards('time_to_income', [
                { value: 'fast', label: 'Fast Cash Flow', sub: 'First harvest in < 3 months' },
                { value: 'medium', label: 'Medium Term', sub: '3–18 months to harvest' },
                { value: 'long', label: 'Long Term OK', sub: '18+ months acceptable' }
              ], inp.time_to_income)}
            </div>
          </div>

        </div>
      </fieldset>

      <!-- FORM ACTIONS -->
      <div class="form-actions">
        <div id="form-error" class="form-error" role="alert" aria-live="assertive" hidden></div>
        <button type="submit" class="btn-primary btn-run" id="run-analysis-btn">
          Run Crop Analysis
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <button type="button" class="btn-ghost" id="reset-form-btn">Clear form</button>
      </div>

    </form>
  </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESULTS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function renderResultsView() {
  const results = State.results;

  if (!State.hasResults || results.length === 0) {
    return renderEmptyResults();
  }

  const sorted = sortResults(results, State.sortMode);
  const bestFit = sorted.filter(r => r.band.key === 'best-fit');
  const caution = sorted.filter(r => r.band.key === 'caution');
  const notRec  = sorted.filter(r => r.band.key === 'not-recommended');

  const compareCount = State.compareIds.size;
  const regionLabel = State.inputs.regionLabel || State.inputs.region || 'your region';

  return `
  <div class="view-results">
    <div class="view-header results-header">
      <div class="results-header-left">
        <h1 class="view-title">Results</h1>
        <p class="view-subtitle">
          Showing suitability rankings for <strong>${escHtml(regionLabel)}</strong>,
          ${State.inputs.season ? '<strong>' + escHtml(State.inputs.season) + ' planting</strong>, ' : ''}
          ${State.inputs.duration_type ? escHtml(formatDuration(State.inputs.duration_type)) + '.' : ''}
        </p>
      </div>
      <div class="results-header-actions">
        <button class="btn-ghost btn-sm" id="back-to-planner-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Edit inputs
        </button>
        ${compareCount > 0 ? `
        <button class="btn-outline btn-sm" id="go-compare-btn">
          Compare ${compareCount} crops
        </button>` : ''}
      </div>
    </div>

    <!-- Active filters summary -->
    <div class="active-filters" role="region" aria-label="Active filters">
      ${renderActiveFilters()}
    </div>

    <!-- Sort controls -->
    <div class="sort-bar">
      <span class="sort-label">Sort by:</span>
      <div class="sort-options" role="group" aria-label="Sort results">
        ${renderSortButton('suitability', 'Suitability')}
        ${renderSortButton('ease', 'Ease of growth')}
        ${renderSortButton('income', 'Time to income')}
        ${renderSortButton('market', 'Market depth')}
        ${renderSortButton('water', 'Water demand')}
      </div>
    </div>

    <!-- Compare hint -->
    ${compareCount < 3 ? `
    <div class="compare-hint" role="note">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
      Tick up to 3 crops to compare side-by-side
    </div>` : `
    <div class="compare-hint compare-hint--ready" role="note">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
      3 crops selected — <button class="link-btn" id="go-compare-btn-2">view comparison</button>
    </div>`}

    <!-- Results sections -->
    ${bestFit.length > 0 ? `
    <section class="results-section" aria-label="Best fit crops">
      <h2 class="results-section-title results-section-title--best">
        <span class="band-dot band-dot--best"></span>
        Best Fit
        <span class="results-count">${bestFit.length} crop${bestFit.length !== 1 ? 's' : ''}</span>
      </h2>
      <div class="crop-grid">
        ${bestFit.map(r => renderCropCard(r)).join('')}
      </div>
    </section>` : ''}

    ${caution.length > 0 ? `
    <section class="results-section" aria-label="Possible with caution crops">
      <h2 class="results-section-title results-section-title--caution">
        <span class="band-dot band-dot--caution"></span>
        Possible with Caution
        <span class="results-count">${caution.length} crop${caution.length !== 1 ? 's' : ''}</span>
      </h2>
      <div class="crop-grid">
        ${caution.map(r => renderCropCard(r)).join('')}
      </div>
    </section>` : ''}

    ${notRec.length > 0 ? `
    <details class="results-section results-section--collapsed">
      <summary class="results-section-title results-section-title--not-rec">
        <span class="band-dot band-dot--not-rec"></span>
        Not Recommended
        <span class="results-count">${notRec.length} crop${notRec.length !== 1 ? 's' : ''}</span>
        <svg class="chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </summary>
      <div class="crop-grid" style="margin-top: var(--space-4)">
        ${notRec.map(r => renderCropCard(r)).join('')}
      </div>
    </details>` : ''}

    <div class="results-disclaimer">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Results are directional indicators based on the conditions you selected. They do not replace local agronomic assessment, soil testing, or market due diligence.
      <button class="link-btn" data-nav="methodology">View methodology</button>
    </div>
  </div>
  `;
}

function renderCropCard(result) {
  const { crop, score, band, reasonSentence, warnings, lowConfidence } = result;
  const isCompared = State.compareIds.has(crop.id);
  const compareDisabled = !isCompared && State.compareIds.size >= 3;

  return `
  <article class="crop-card crop-card--${band.key}" data-crop-id="${escHtml(crop.id)}" aria-label="${escHtml(crop.name)} crop card">
    <div class="crop-card-top">
      <div class="crop-card-header">
        <div class="crop-card-name-row">
          <h3 class="crop-card-name">${escHtml(crop.name)}</h3>
          <span class="band-badge band-badge--${band.key}">${escHtml(band.label)}</span>
        </div>
        <div class="crop-card-meta-row">
          <span class="crop-tag">${escHtml(formatDuration(crop.duration_type))}</span>
          <span class="crop-tag">${escHtml(crop.category)}</span>
        </div>
      </div>
      <div class="score-ring-wrap" aria-label="Suitability score: ${score} out of 100">
        <svg class="score-ring" viewBox="0 0 40 40" width="52" height="52" aria-hidden="true">
          <circle class="score-ring-bg" cx="20" cy="20" r="16" fill="none" stroke-width="3"/>
          <circle class="score-ring-fill score-ring-fill--${band.key}" cx="20" cy="20" r="16" fill="none" stroke-width="3"
            stroke-dasharray="${Math.round(2 * Math.PI * 16)}"
            stroke-dashoffset="${Math.round(2 * Math.PI * 16 * (1 - score / 100))}"
            transform="rotate(-90 20 20)"/>
        </svg>
        <span class="score-value">${score}</span>
      </div>
    </div>

    <p class="crop-reason">${escHtml(reasonSentence)}</p>

    ${warnings.length > 0 ? `
    <ul class="crop-warnings" aria-label="Cautions">
      ${warnings.slice(0, 2).map(w => `<li class="crop-warning"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>${escHtml(w)}</li>`).join('')}
    </ul>` : ''}

    <dl class="crop-details">
      <div class="crop-detail-row">
        <dt>Water need</dt>
        <dd><span class="detail-pill detail-pill--water-${crop.water_requirement}">${escHtml(formatWater(crop.water_requirement))}</span></dd>
      </div>
      <div class="crop-detail-row">
        <dt>Soil preference</dt>
        <dd>${crop.soil_types.map(s => formatSoil(s)).join(', ')}</dd>
      </div>
      <div class="crop-detail-row">
        <dt>Time to income</dt>
        <dd>${escHtml(formatTimeToIncome(crop.time_to_income))}</dd>
      </div>
      <div class="crop-detail-row">
        <dt>Management</dt>
        <dd>${escHtml(formatManagement(crop.management_level))}</dd>
      </div>
      <div class="crop-detail-row">
        <dt>Market channels</dt>
        <dd>${crop.market_channels.map(m => formatMarket(m)).join(', ')}</dd>
      </div>
    </dl>

    <p class="crop-notes">${escHtml(crop.notes)}</p>

    ${lowConfidence ? `<p class="confidence-note"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Soil type not specified — verify soil compatibility</p>` : ''}

    <div class="crop-card-actions">
      <label class="compare-check ${compareDisabled ? 'compare-check--disabled' : ''}" aria-label="Add ${escHtml(crop.name)} to comparison">
        <input
          type="checkbox"
          class="compare-checkbox"
          data-crop-id="${escHtml(crop.id)}"
          ${isCompared ? 'checked' : ''}
          ${compareDisabled ? 'disabled' : ''}
          aria-label="Compare ${escHtml(crop.name)}"
        >
        <span>${isCompared ? 'Added to compare' : compareDisabled ? 'Compare limit reached' : 'Compare'}</span>
      </label>
      <button class="btn-ghost btn-sm discuss-btn" data-crop="${escHtml(crop.name)}">
        Discuss this option
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
      </button>
    </div>
  </article>
  `;
}

function renderEmptyResults() {
  return `
  <div class="view-results view-empty">
    <div class="empty-state">
      <svg class="empty-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path d="M12 22V12M12 12C12 7 7 3 3 3M12 12C12 7 17 3 21 3M8 22h8"/>
        <circle cx="12" cy="6" r="2"/>
      </svg>
      <h2 class="empty-title">No analysis run yet</h2>
      <p class="empty-body">Complete the planner form to generate crop suitability recommendations for your farm conditions.</p>
      <button class="btn-primary" data-nav="planner">Go to planner</button>
    </div>
  </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPARE VIEW
// ─────────────────────────────────────────────────────────────────────────────
function renderCompareView() {
  const compareIds = [...State.compareIds];

  if (compareIds.length === 0) {
    return `
    <div class="view-compare view-empty">
      <div class="empty-state">
        <svg class="empty-icon" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="2" y="3" width="7" height="18" rx="1"/>
          <rect x="9.5" y="3" width="5" height="18" rx="1"/>
          <rect x="16" y="3" width="6" height="18" rx="1"/>
        </svg>
        <h2 class="empty-title">No crops selected for comparison</h2>
        <p class="empty-body">Return to the results view and tick the "Compare" checkbox on up to 3 crops.</p>
        <button class="btn-primary" data-nav="results">Back to results</button>
      </div>
    </div>
    `;
  }

  const compareResults = compareIds
    .map(id => State.results.find(r => r.crop.id === id))
    .filter(Boolean);

  if (compareResults.length === 0) {
    return `<div class="view-compare view-empty"><div class="empty-state"><p>No results found. <button class="link-btn" data-nav="planner">Run the planner first</button>.</p></div></div>`;
  }

  // Build comparison rows
  const fields = [
    { label: 'Suitability Score', render: r => `<strong>${r.score}/100</strong>` },
    { label: 'Status', render: r => `<span class="band-badge band-badge--${r.band.key}">${r.band.label}</span>` },
    { label: 'Crop Type', render: r => formatDuration(r.crop.duration_type) },
    { label: 'Category', render: r => r.crop.category },
    { label: 'Water Requirement', render: r => `<span class="detail-pill detail-pill--water-${r.crop.water_requirement}">${formatWater(r.crop.water_requirement)}</span>` },
    { label: 'Management', render: r => formatManagement(r.crop.management_level) },
    { label: 'Time to Income', render: r => formatTimeToIncome(r.crop.time_to_income) },
    { label: 'Soil Preference', render: r => r.crop.soil_types.map(s => formatSoil(s)).join(', ') },
    { label: 'Market Channels', render: r => r.crop.market_channels.map(m => formatMarket(m)).join(', ') },
    { label: 'Frost Tolerance', render: r => formatManagement(r.crop.frost_tolerance) },
    { label: 'Wind Tolerance', render: r => formatManagement(r.crop.wind_tolerance) },
    { label: 'Farm Scale Fit', render: r => r.crop.farm_scale.map(s => formatScale(s)).join(', ') },
    { label: 'Summary', render: r => `<em>${escHtml(r.reasonSentence)}</em>` },
    { label: 'Main Risks', render: r => `<ul class="compare-risk-list">${r.crop.risks.map(risk => `<li>${escHtml(risk)}</li>`).join('')}</ul>` },
    { label: 'Notes', render: r => escHtml(r.crop.notes) }
  ];

  return `
  <div class="view-compare">
    <div class="view-header">
      <h1 class="view-title">Side-by-Side Comparison</h1>
      <button class="btn-ghost btn-sm" data-nav="results">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to results
      </button>
    </div>

    <div class="compare-table-wrap">
      <table class="compare-table" aria-label="Crop comparison table">
        <thead>
          <tr>
            <th class="compare-row-label">Attribute</th>
            ${compareResults.map(r => `<th class="compare-col-header">${escHtml(r.crop.name)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${fields.map(field => `
          <tr>
            <td class="compare-row-label">${escHtml(field.label)}</td>
            ${compareResults.map(r => `<td class="compare-cell">${field.render(r)}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="compare-cta-row">
      ${compareResults.map(r => `
      <button class="btn-ghost btn-sm discuss-btn" data-crop="${escHtml(r.crop.name)}">
        Discuss ${escHtml(r.crop.name)}
      </button>`).join('')}
    </div>
  </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIBRARY VIEW
// ─────────────────────────────────────────────────────────────────────────────
function renderLibraryView() {
  const grouped = {};
  CROPS.forEach(crop => {
    const key = crop.duration_type;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(crop);
  });

  const durationOrder = ['annual', 'short-perennial', 'long-perennial'];

  return `
  <div class="view-library">
    <div class="view-header">
      <h1 class="view-title">Crop Library</h1>
      <p class="view-subtitle">All ${CROPS.length} crops in the CropFit database. Use the planner to score these against your specific conditions.</p>
    </div>

    ${durationOrder.map(dtype => {
      const crops = grouped[dtype] || [];
      if (crops.length === 0) return '';
      return `
      <section class="library-section" aria-label="${formatDuration(dtype)} crops">
        <h2 class="library-section-title">${escHtml(formatDuration(dtype))}</h2>
        <div class="library-grid">
          ${crops.map(crop => `
          <div class="library-card">
            <div class="library-card-header">
              <h3 class="library-card-name">${escHtml(crop.name)}</h3>
              <span class="crop-tag crop-tag--sm">${escHtml(crop.category)}</span>
            </div>
            <dl class="library-card-details">
              <div class="library-detail-row">
                <dt>Water</dt>
                <dd><span class="detail-pill detail-pill--water-${crop.water_requirement}">${escHtml(formatWater(crop.water_requirement))}</span></dd>
              </div>
              <div class="library-detail-row">
                <dt>Management</dt>
                <dd>${escHtml(formatManagement(crop.management_level))}</dd>
              </div>
              <div class="library-detail-row">
                <dt>Time to income</dt>
                <dd>${escHtml(formatTimeToIncome(crop.time_to_income))}</dd>
              </div>
              <div class="library-detail-row">
                <dt>Climate zones</dt>
                <dd>${crop.climate_zones.map(z => REGION_ARCHETYPES[z]?.label || z).join(', ')}</dd>
              </div>
              <div class="library-detail-row">
                <dt>Markets</dt>
                <dd>${crop.market_channels.map(m => formatMarket(m)).join(', ')}</dd>
              </div>
            </dl>
            <p class="library-card-notes">${escHtml(crop.notes)}</p>
          </div>`).join('')}
        </div>
      </section>
      `;
    }).join('')}
  </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// METHODOLOGY VIEW
// ─────────────────────────────────────────────────────────────────────────────
function renderMethodologyView() {
  return `
  <div class="view-methodology">
    <div class="view-header">
      <h1 class="view-title">About the Methodology</h1>
      <p class="view-subtitle">How CropFit Planner generates its recommendations — and what it is and is not designed to do.</p>
    </div>

    <div class="methodology-content">

      <section class="method-section">
        <h2>What this tool does</h2>
        <p>CropFit Planner is a <strong>decision-support tool</strong>. It helps farmers and agricultural consultants understand which crops are likely to suit their farm conditions based on a set of agronomic and logistical criteria. It narrows down options and provides ranked suitability indicators — it does not guarantee outcomes or replace expert advice.</p>
        <p>Results are classified into three bands:</p>
        <ul>
          <li><span class="band-badge band-badge--best-fit">Best Fit</span> — Score 80–100: Strong alignment across most key criteria.</li>
          <li><span class="band-badge band-badge--caution">Possible with Caution</span> — Score 60–79: Some positive alignment, but one or more criteria present challenges.</li>
          <li><span class="band-badge band-badge--not-recommended">Not Recommended</span> — Score below 60: Significant misalignment in one or more critical areas.</li>
        </ul>
      </section>

      <section class="method-section">
        <h2>How the scoring works</h2>
        <p>Each crop begins with a base score of <strong>50</strong>. Score adjustments are then applied based on how well your farm conditions match the crop's agronomic requirements.</p>
        <p>Criteria are weighted by importance:</p>
        <table class="method-table">
          <thead>
            <tr><th>Criterion</th><th>Weight</th><th>Rationale</th></tr>
          </thead>
          <tbody>
            <tr><td>Climate / region match</td><td>High (±18)</td><td>Crops that cannot grow in a climate zone fail fundamentally</td></tr>
            <tr><td>Planting season</td><td>High (±16)</td><td>Wrong season equals crop failure in most cases</td></tr>
            <tr><td>Water availability</td><td>High (±16)</td><td>Water is a primary production constraint</td></tr>
            <tr><td>Crop duration type</td><td>High (±12)</td><td>Annual vs perennial is a business model decision</td></tr>
            <tr><td>Market channel fit</td><td>Medium-High (±10)</td><td>Producing for the wrong market limits viability</td></tr>
            <tr><td>Management intensity</td><td>Medium (±8)</td><td>High-management crops on low-capacity farms are risky</td></tr>
            <tr><td>Soil type</td><td>Medium (±8)</td><td>Soil compatibility matters but can often be managed</td></tr>
            <tr><td>Farm scale</td><td>Medium (±7)</td><td>Some crops only make economic sense at scale</td></tr>
            <tr><td>Frost / wind / drainage</td><td>Low (±2–3)</td><td>Fine-tuning modifiers — important but rarely decisive alone</td></tr>
            <tr><td>Time to income</td><td>Low (±2)</td><td>Preference alignment modifier</td></tr>
          </tbody>
        </table>
        <p>Unknown soil type does not penalise the score but lowers the confidence indicator on the result card.</p>
      </section>

      <section class="method-section">
        <h2>Region classification</h2>
        <p>CropFit v1 uses five simplified region archetypes to match crop climate requirements to South African farming areas:</p>
        <ul>
          ${Object.entries(REGION_ARCHETYPES).map(([key, r]) => `
          <li><strong>${escHtml(r.label)}</strong> — ${escHtml(r.description)} <em>(Examples: ${escHtml(r.examples)})</em></li>
          `).join('')}
        </ul>
        <p>These archetypes are intentionally simplified for v1. Future versions will incorporate spatial GIS data for more precise regional classification.</p>
      </section>

      <section class="method-section">
        <h2>Crop dataset</h2>
        <p>The crop library currently contains <strong>${CROPS.length} crops</strong>, covering a range of annuals, short-term perennials, and long-term orchard crops relevant to South African production systems. Each crop profile includes climate zone preferences, seasonal suitability, water and soil requirements, market channel fit, and agronomic notes.</p>
        <p>The dataset is structured to be expanded — additional crops can be added by creating a new entry in the <code>cropData.js</code> file following the documented field format.</p>
      </section>

      <section class="method-section">
        <h2>Important limitations</h2>
        <ul>
          <li>This tool does not account for local micro-climates, specific soil chemistry, or field-level topographic factors.</li>
          <li>Market channel fit is based on general crop-market relationships — actual market access depends on your location, buyer relationships, and compliance requirements.</li>
          <li>Suitability scores are directional indicators, not production forecasts.</li>
          <li>No agronomic tool replaces a detailed soil test, local extension officer input, or market feasibility study before commercial commitment.</li>
          <li>Water availability assessments should be confirmed against actual water use licences and supply reliability, not assumptions.</li>
        </ul>
      </section>

      <section class="method-section">
        <h2>Future integration points</h2>
        <p>CropFit is designed to be extensible. Planned future enhancements include:</p>
        <ul>
          <li>Integration with South African weather station and rainfall data APIs for climate-based regional auto-classification</li>
          <li>Connection to market price databases for real-time price-per-kg indicators</li>
          <li>Soil data integration from existing national soil surveys</li>
          <li>Expansion of the crop database to include more regionally specific varieties</li>
        </ul>
      </section>

    </div>
  </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER RENDERERS
// ─────────────────────────────────────────────────────────────────────────────
function renderRadioCards(name, options, currentValue) {
  return options.map(opt => `
  <label class="radio-card ${currentValue === opt.value ? 'radio-card--selected' : ''}">
    <input type="radio" name="${escHtml(name)}" value="${escHtml(opt.value)}" ${currentValue === opt.value ? 'checked' : ''} class="radio-input sr-only">
    <span class="radio-card-label">${escHtml(opt.label)}</span>
    <span class="radio-card-sub">${escHtml(opt.sub)}</span>
  </label>
  `).join('');
}

function renderRegionOptions(currentValue) {
  return Object.entries(REGION_ARCHETYPES).map(([key, r]) => `
  <label class="radio-card radio-card--region ${currentValue === key ? 'radio-card--selected' : ''}">
    <input type="radio" name="region" value="${escHtml(key)}" ${currentValue === key ? 'checked' : ''} class="radio-input sr-only">
    <span class="radio-card-label">${escHtml(r.label)}</span>
    <span class="radio-card-sub">${escHtml(r.examples)}</span>
  </label>
  `).join('');
}

function renderActiveFilters() {
  const inp = State.inputs;
  const tags = [];
  if (inp.regionLabel) tags.push(`Region: ${inp.regionLabel}`);
  else if (inp.region) tags.push(`Region: ${REGION_ARCHETYPES[inp.region]?.label || inp.region}`);
  if (inp.season) tags.push(`Season: ${inp.season}`);
  if (inp.duration_type) tags.push(formatDuration(inp.duration_type));
  if (inp.water_access) tags.push(`Water: ${inp.water_access}`);
  if (inp.soil_type && inp.soil_type !== 'unknown') tags.push(`Soil: ${formatSoil(inp.soil_type)}`);
  if (inp.management) tags.push(`Mgmt: ${inp.management}`);
  if (inp.market) tags.push(formatMarket(inp.market));
  if (inp.farm_scale) tags.push(formatScale(inp.farm_scale));

  if (tags.length === 0) return '';
  return `<div class="filter-tags">${tags.map(t => `<span class="filter-tag">${escHtml(t)}</span>`).join('')}</div>`;
}

function renderSortButton(mode, label) {
  const active = State.sortMode === mode;
  return `<button class="sort-btn ${active ? 'sort-btn--active' : ''}" data-sort="${mode}">${escHtml(label)}</button>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV ACTIVE STATE
// ─────────────────────────────────────────────────────────────────────────────
function updateNavActive() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.setAttribute('aria-current', el.dataset.nav === State.view ? 'page' : 'false');
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW EVENT HANDLERS
// ─────────────────────────────────────────────────────────────────────────────
function attachViewHandlers() {
  // Sort buttons
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      State.sortMode = btn.dataset.sort;
      const _render = window.CropFit?.renderAndAttach || render;
      _render();
    });
  });

  // Nav buttons (data-nav attribute)
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(btn.dataset.nav);
      // Use CropFit.renderAndAttach if available (ensures formHandler attaches on planner)
      if (window.CropFit?.renderAndAttach) {
        window.CropFit.renderAndAttach();
      } else {
        render();
      }
    });
  });

  // Compare checkboxes
  document.querySelectorAll('.compare-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const cropId = cb.dataset.cropId;
      const success = toggleCompare(cropId);
      if (!success) {
        cb.checked = false;
        showCompareMaxToast();
      }
      const _render = window.CropFit?.renderAndAttach || render;
      _render();
    });
  });

  // Back to planner
  const backBtn = document.getElementById('back-to-planner-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      navigate('planner');
      const _render = window.CropFit?.renderAndAttach || render;
      _render();
    });
  }

  // Go to compare
  document.querySelectorAll('#go-compare-btn, #go-compare-btn-2').forEach(btn => {
    btn?.addEventListener('click', () => {
      navigate('compare');
      const _render = window.CropFit?.renderAndAttach || render;
      _render();
    });
  });

  // Discuss this option
  document.querySelectorAll('.discuss-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cropName = btn.dataset.crop;
      const mailto = `mailto:?subject=CropFit%20Planner%20-%20Discuss%20${encodeURIComponent(cropName)}&body=I%20would%20like%20to%20discuss%20${encodeURIComponent(cropName)}%20as%20a%20potential%20crop%20option%20based%20on%20CropFit%20Planner%20analysis.`;
      window.open(mailto, '_blank');
    });
  });

  // Advanced toggle
  const toggle = document.getElementById('advanced-toggle');
  const body = document.getElementById('advanced-body');
  if (toggle && body) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      body.hidden = expanded;
    });
    toggle.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.click();
      }
    });
  }
}

function showCompareMaxToast() {
  const existing = document.querySelector('.toast-max-compare');
  if (existing) return;
  const toast = document.createElement('div');
  toast.className = 'toast-max-compare toast';
  toast.setAttribute('role', 'alert');
  toast.textContent = 'You can compare up to 3 crops at a time. Deselect one to add another.';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────────────────
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export { renderEmptyResults, escHtml };
