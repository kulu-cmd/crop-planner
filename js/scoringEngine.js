/**
 * CropFit Planner — Scoring Engine
 * =====================================
 * Rule-based, transparent, readable crop suitability scorer.
 *
 * HOW IT WORKS:
 * 1. Each crop starts at a base score of 50.
 * 2. Score adjustments (positive or negative) are applied per criterion.
 * 3. High-weight criteria (climate, water, season) cause large swings.
 * 4. Medium-weight criteria (soil, management, market) cause moderate swings.
 * 5. Low-weight optional criteria (frost, wind, drainage) fine-tune the score.
 * 6. Score is clamped to 0–100.
 * 7. Score bands: 80-100 = Best Fit | 60-79 = Possible with Caution | <60 = Not Recommended
 *
 * HOW TO ADJUST WEIGHTS:
 * Edit the WEIGHTS object below. Values represent the max points added or
 * deducted per criterion. Keep the numbers proportional to each other.
 *
 * HOW TO ADD NEW CRITERIA:
 * 1. Add field to crop data in cropData.js
 * 2. Add corresponding input to the planner form
 * 3. Add a scoring block in scoreCrop() following the existing pattern
 * 4. Add a reason string in generateReasonSentence()
 */

// ─────────────────────────────────────────────────────────────────────────────
// WEIGHTS — Adjust these to change how much each factor influences the result
// ─────────────────────────────────────────────────────────────────────────────
// Design principle:
//   Base score = 30 (neutral starting point, below minimum threshold)
//   Max possible addition: ~70 points to reach 100
//   A 'perfect match' across all criteria → score ~100
//   A 'partial match' (many criteria match, a few miss) → score 65-79
//   A 'poor match' (several critical mismatches) → score <60
const WEIGHTS = {
  climate:          14,   // HIGH — Location/climate zone match
  season:           13,   // HIGH — Planting season alignment  
  water:            13,   // HIGH — Water availability match
  duration:         10,   // HIGH — Annual vs perennial preference
  market:            8,   // MEDIUM-HIGH — Market channel fit
  management:        6,   // MEDIUM — Management intensity preference
  soil:              7,   // MEDIUM — Soil type compatibility
  farm_scale:        5,   // MEDIUM — Farm size suitability
  frost:             3,   // LOW — Frost risk filter
  wind:              2,   // LOW — Wind exposure filter
  drainage:          2,   // LOW — Soil drainage preference
  time_to_income:    2,   // LOW — Time-to-income preference alignment
};

// Sum of all positives: 14+13+13+10+8+6+7+5+3+2+2+2 = 85
// Base 30 + 85 max = 115 max (clamped to 100), ensuring perfect match = ~95-100

// ─────────────────────────────────────────────────────────────────────────────
// SCORE BANDS
// ─────────────────────────────────────────────────────────────────────────────
export const SCORE_BANDS = {
  BEST_FIT: { min: 80, label: 'Best Fit', key: 'best-fit' },
  CAUTION:  { min: 60, label: 'Possible with Caution', key: 'caution' },
  NOT_REC:  { min: 0,  label: 'Not Recommended', key: 'not-recommended' }
};

export function getBand(score) {
  if (score >= SCORE_BANDS.BEST_FIT.min) return SCORE_BANDS.BEST_FIT;
  if (score >= SCORE_BANDS.CAUTION.min)  return SCORE_BANDS.CAUTION;
  return SCORE_BANDS.NOT_REC;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCORING FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Score a single crop against user inputs.
 * @param {object} crop       — Crop profile from cropData.js
 * @param {object} inputs     — User form inputs (see below for shape)
 * @returns {object}          — { score, band, reasons, warnings, adjustments }
 *
 * inputs shape:
 * {
 *   region:         string  — archetype key from REGION_ARCHETYPES
 *   season:         string  — 'summer'|'autumn'|'winter'|'spring'
 *   duration_type:  string  — 'annual'|'short-perennial'|'long-perennial'
 *   water_access:   string  — 'rainfed'|'limited'|'reliable'
 *   soil_type:      string  — soil key or 'unknown'
 *   management:     string  — 'low'|'moderate'|'high'
 *   market:         string  — market channel key
 *   farm_scale:     string  — 'micro'|'small'|'medium'|'large'
 *   frost_risk:     string? — 'low'|'medium'|'high' (optional)
 *   wind_exposure:  string? — 'low'|'medium'|'high' (optional)
 *   drainage:       string? — 'poor'|'moderate'|'good' (optional)
 *   time_to_income: string? — 'fast'|'medium'|'long' (optional)
 * }
 */
export function scoreCrop(crop, inputs) {
  let score = 30; // Base score — starts below threshold; needs positive matches to rise
  const adjustments = []; // Log all adjustments for transparency
  const reasons = [];     // Positive reason fragments
  const warnings = [];    // Caution/warning fragments

  // ── 1. CLIMATE / REGION MATCH ───────────────────────────────────────────
  if (inputs.region) {
    if (crop.climate_zones.includes(inputs.region)) {
      score += WEIGHTS.climate;
      reasons.push('climate zone match');
    } else {
      // Partial credit for adjacent/compatible zones
      const adjacentPairs = {
        'warm-humid-subtropical': ['warm-sub-humid-inland'],
        'warm-sub-humid-inland':  ['warm-humid-subtropical', 'semi-arid', 'cooler-highland'],
        'semi-arid':              ['warm-sub-humid-inland'],
        'cooler-highland':        ['warm-sub-humid-inland'],
        'mediterranean-winter-rainfall': []
      };
      const adjacent = adjacentPairs[inputs.region] || [];
      const partialMatch = crop.climate_zones.some(z => adjacent.includes(z));
      if (partialMatch) {
        score += Math.round(WEIGHTS.climate * 0.4);
        warnings.push('marginal climate zone fit');
      } else {
        score -= WEIGHTS.climate;
        warnings.push('climate zone mismatch');
      }
    }
    adjustments.push({ criterion: 'Climate', value: score - 50 });
  }

  // ── 2. PLANTING SEASON MATCH ────────────────────────────────────────────
  if (inputs.season) {
    if (crop.suitable_seasons.includes(inputs.season)) {
      score += WEIGHTS.season;
      reasons.push(`suitable for ${inputs.season} planting`);
    } else {
      score -= WEIGHTS.season;
      warnings.push(`not ideal for ${inputs.season} planting window`);
    }
  }

  // ── 3. WATER AVAILABILITY MATCH ─────────────────────────────────────────
  if (inputs.water_access) {
    const waterMap = {
      // crop water_requirement → what water_access works
      low:      { rainfed: +1, limited: +0.5, reliable: +0.5 },
      moderate: { rainfed: -0.5, limited: +0.5, reliable: +1 },
      high:     { rainfed: -1, limited: -0.5, reliable: +1 }
    };
    const modifier = waterMap[crop.water_requirement]?.[inputs.water_access] ?? 0;
    const delta = Math.round(WEIGHTS.water * modifier);
    score += delta;
    if (modifier >= 0.5) {
      reasons.push(`water needs align with ${inputs.water_access.replace('-', ' ')}`);
    } else if (modifier < 0) {
      warnings.push(
        crop.water_requirement === 'high' && inputs.water_access === 'rainfed'
          ? 'this crop requires reliable irrigation — rainfed conditions are a significant risk'
          : `water availability may be insufficient for this crop`
      );
    }
  }

  // ── 4. CROP DURATION TYPE ───────────────────────────────────────────────
  if (inputs.duration_type) {
    if (crop.duration_type === inputs.duration_type) {
      score += WEIGHTS.duration;
      reasons.push(`matches your preferred crop type (${formatDuration(inputs.duration_type)})`);
    } else if (
      (inputs.duration_type === 'annual' && crop.duration_type !== 'annual') ||
      (inputs.duration_type === 'long-perennial' && crop.duration_type === 'annual')
    ) {
      // Hard mismatch
      score -= WEIGHTS.duration;
      warnings.push(`crop duration type (${formatDuration(crop.duration_type)}) doesn't match your preference`);
    } else {
      // Soft mismatch (short-perennial vs long, etc.)
      score -= Math.round(WEIGHTS.duration * 0.5);
      warnings.push(`crop duration is ${formatDuration(crop.duration_type)}, somewhat different from your preference`);
    }
  }

  // ── 5. MARKET CHANNEL FIT ───────────────────────────────────────────────
  if (inputs.market) {
    if (crop.market_channels.includes(inputs.market)) {
      score += WEIGHTS.market;
      reasons.push(`aligns with ${formatMarket(inputs.market)} market channel`);
    } else {
      score -= Math.round(WEIGHTS.market * 0.7);
      warnings.push(`limited fit for ${formatMarket(inputs.market)} market`);
    }
  }

  // ── 6. MANAGEMENT INTENSITY MATCH ───────────────────────────────────────
  if (inputs.management) {
    if (crop.management_level === inputs.management) {
      score += WEIGHTS.management;
      reasons.push(`matches your management capacity (${inputs.management})`);
    } else if (
      (inputs.management === 'low' && crop.management_level === 'high') ||
      (inputs.management === 'high' && crop.management_level === 'low')
    ) {
      // Opposite ends
      score -= Math.round(WEIGHTS.management * 0.75);
      warnings.push(
        inputs.management === 'low'
          ? 'this crop requires high management — may exceed your preferred intensity'
          : 'this is a low-management crop if you are looking to maximise production complexity'
      );
    } else {
      // Adjacent (low-moderate or moderate-high)
      score -= Math.round(WEIGHTS.management * 0.25);
    }
  }

  // ── 7. SOIL TYPE COMPATIBILITY ──────────────────────────────────────────
  if (inputs.soil_type && inputs.soil_type !== 'unknown') {
    if (crop.soil_types.includes(inputs.soil_type)) {
      score += WEIGHTS.soil;
      reasons.push(`compatible with your soil type (${formatSoil(inputs.soil_type)})`);
    } else {
      // Check for adjacent/compatible soil types
      const soilCompatibility = {
        'sandy':       ['sandy-loam'],
        'sandy-loam':  ['sandy', 'loam'],
        'loam':        ['sandy-loam', 'clay-loam'],
        'clay-loam':   ['loam', 'clay'],
        'clay':        ['clay-loam'],
        'shallow-rocky': []
      };
      const compatible = soilCompatibility[inputs.soil_type] || [];
      const partialSoil = crop.soil_types.some(s => compatible.includes(s));
      if (partialSoil) {
        score += Math.round(WEIGHTS.soil * 0.4);
        // No warning for adjacent soil — slight confidence reduction only
      } else {
        score -= Math.round(WEIGHTS.soil * 0.75);
        warnings.push(`soil type (${formatSoil(inputs.soil_type)}) is not ideal for this crop`);
      }
    }
  }
  // Unknown soil: no penalty — lower confidence only (handled in output)

  // ── 8. FARM SCALE FIT ───────────────────────────────────────────────────
  if (inputs.farm_scale) {
    if (crop.farm_scale.includes(inputs.farm_scale)) {
      score += WEIGHTS.farm_scale;
      reasons.push(`suited to ${formatScale(inputs.farm_scale)} farm scale`);
    } else {
      score -= Math.round(WEIGHTS.farm_scale * 0.6);
      warnings.push(`crop is typically better suited to different farm scales`);
    }
  }

  // ── 9. FROST RISK (optional) ────────────────────────────────────────────
  if (inputs.frost_risk) {
    // Frost risk = how much frost the farm site gets
    // frost_tolerance = how much the crop can handle
    const frostMatrix = {
      // [site_frost_risk][crop_frost_tolerance]
      low:    { low: +1, medium: +1, high: +1 },   // Low frost risk → all crops fine
      medium: { low: -0.5, medium: +0.5, high: +1 }, // Medium risk → sensitive crops warned
      high:   { low: -1, medium: -0.5, high: +1 }    // High frost risk → only hardy crops
    };
    const modifier = frostMatrix[inputs.frost_risk]?.[crop.frost_tolerance] ?? 0;
    const delta = Math.round(WEIGHTS.frost * modifier);
    score += delta;
    if (modifier < 0) {
      warnings.push(`frost-sensitive crop on a site with ${inputs.frost_risk} frost risk`);
    }
  }

  // ── 10. WIND EXPOSURE (optional) ────────────────────────────────────────
  if (inputs.wind_exposure) {
    const windMatrix = {
      low:    { low: +1, medium: +1, high: +1 },
      medium: { low: -0.5, medium: +0.5, high: +1 },
      high:   { low: -1, medium: -0.25, high: +0.5 }
    };
    const modifier = windMatrix[inputs.wind_exposure]?.[crop.wind_tolerance] ?? 0;
    const delta = Math.round(WEIGHTS.wind * modifier);
    score += delta;
    if (modifier < 0 && inputs.wind_exposure === 'high') {
      warnings.push(`wind-sensitive crop on an exposed site`);
    }
  }

  // ── 11. DRAINAGE (optional) ─────────────────────────────────────────────
  if (inputs.drainage) {
    if (crop.drainage_preference === inputs.drainage) {
      score += WEIGHTS.drainage;
    } else if (
      (inputs.drainage === 'poor' && crop.drainage_preference === 'good') ||
      (inputs.drainage === 'good' && crop.drainage_preference === 'poor')
    ) {
      score -= WEIGHTS.drainage;
      if (inputs.drainage === 'poor') {
        warnings.push(`this crop prefers well-drained soils — poorly drained sites are a risk`);
      }
    }
  }

  // ── 12. TIME TO INCOME (optional) ───────────────────────────────────────
  if (inputs.time_to_income) {
    if (crop.time_to_income === inputs.time_to_income) {
      score += WEIGHTS.time_to_income;
    } else if (
      (inputs.time_to_income === 'fast' && crop.time_to_income === 'long') ||
      (inputs.time_to_income === 'long' && crop.time_to_income === 'fast')
    ) {
      score -= WEIGHTS.time_to_income;
    }
  }

  // ── CLAMP to 0–100 ────────────────────────────────────────────────────
  score = Math.max(0, Math.min(100, Math.round(score)));

  // ── CONFIDENCE FLAG ────────────────────────────────────────────────────
  const lowConfidence = !inputs.soil_type || inputs.soil_type === 'unknown';

  return {
    crop,
    score,
    band: getBand(score),
    reasons,
    warnings,
    lowConfidence
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REASON SENTENCE GENERATOR
// Generate a human-readable sentence summarising why a crop scored as it did.
// ─────────────────────────────────────────────────────────────────────────────
export function generateReasonSentence(result) {
  const { reasons, warnings, score, band, lowConfidence } = result;

  if (score >= 80) {
    const positives = reasons.length > 0
      ? reasons.slice(0, 3).join(', ')
      : 'strong alignment with your conditions';
    return `Strong match: ${positives}.` +
      (lowConfidence ? ' Soil type unknown — verify compatibility before committing.' : '');
  }

  if (score >= 60) {
    const pos = reasons.length > 0 ? reasons.slice(0, 2).join(' and ') : 'some positive indicators';
    const warn = warnings.length > 0 ? warnings[0] : 'some conditions may need attention';
    return `Possible match — ${pos}, but ${warn}.` +
      (lowConfidence ? ' Confirm soil suitability.' : '');
  }

  // Below 60
  const main = warnings.length > 0
    ? warnings.slice(0, 2).join('; ')
    : 'key conditions are misaligned with this crop\'s requirements';
  return `Not recommended under these conditions: ${main}.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH SCORING — Score all crops and sort by score
// ─────────────────────────────────────────────────────────────────────────────
export function scoreAllCrops(crops, inputs) {
  return crops
    .map(crop => {
      const result = scoreCrop(crop, inputs);
      result.reasonSentence = generateReasonSentence(result);
      return result;
    })
    .sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────────────────────────────────────
// SORT RESULTS — Secondary sort modes
// ─────────────────────────────────────────────────────────────────────────────
export function sortResults(results, sortMode) {
  const sorted = [...results];
  switch (sortMode) {
    case 'ease':
      return sorted.sort((a, b) => {
        const order = { low: 0, moderate: 1, high: 2 };
        return order[a.crop.management_level] - order[b.crop.management_level];
      });
    case 'income':
      return sorted.sort((a, b) => {
        const order = { fast: 0, medium: 1, long: 2 };
        return order[a.crop.time_to_income] - order[b.crop.time_to_income];
      });
    case 'market':
      return sorted.sort((a, b) => {
        // Higher scored first, then by market depth
        const depthA = a.crop.market_channels.length;
        const depthB = b.crop.market_channels.length;
        return depthB - depthA;
      });
    case 'water':
      return sorted.sort((a, b) => {
        const order = { low: 0, moderate: 1, high: 2 };
        return order[a.crop.water_requirement] - order[b.crop.water_requirement];
      });
    case 'suitability':
    default:
      return sorted.sort((a, b) => b.score - a.score);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LABEL HELPERS — used in scoring explanations and result cards
// ─────────────────────────────────────────────────────────────────────────────
export function formatDuration(key) {
  const map = {
    'annual': 'annual/seasonal',
    'short-perennial': 'short-term perennial',
    'long-perennial': 'long-term perennial / orchard'
  };
  return map[key] || key;
}

export function formatMarket(key) {
  const map = {
    'fresh-local': 'fresh local',
    'farmgate': 'farmgate / informal',
    'processor': 'processor / factory',
    'supermarket': 'supermarket program',
    'export': 'export'
  };
  return map[key] || key;
}

export function formatSoil(key) {
  const map = {
    'sandy': 'sandy',
    'sandy-loam': 'sandy loam',
    'loam': 'loam',
    'clay-loam': 'clay loam',
    'clay': 'clay',
    'shallow-rocky': 'shallow/rocky'
  };
  return map[key] || key;
}

export function formatScale(key) {
  const map = {
    'micro': 'under 2 ha',
    'small': '2–10 ha',
    'medium': '10–50 ha',
    'large': '50+ ha'
  };
  return map[key] || key;
}

export function formatWater(key) {
  const map = {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High'
  };
  return map[key] || key;
}

export function formatManagement(key) {
  const map = {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High'
  };
  return map[key] || key;
}

export function formatTimeToIncome(key) {
  const map = {
    fast: 'Fast (< 3 months)',
    medium: 'Medium (3–18 months)',
    long: 'Long (18+ months)'
  };
  return map[key] || key;
}
