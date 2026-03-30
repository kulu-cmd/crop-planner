/**
 * CropFit Planner — Crop Dataset
 * ================================
 * Each crop object defines all agronomic, market, and logistical attributes
 * used by the scoring engine. To add a new crop, copy an existing entry and
 * update all fields. Keep all field values within the defined enum sets.
 *
 * FIELD GUIDE:
 * ─────────────────────────────────────────────────────────────────────────────
 * name            : Display name of the crop
 * id              : Unique slug (lowercase, hyphens)
 * category        : 'vegetable' | 'herb' | 'fruit' | 'grain' | 'root' | 'spice' | 'tree-crop' | 'specialty'
 * duration_type   : 'annual' | 'short-perennial' | 'long-perennial'
 *
 * climate_zones   : Array of region archetypes this crop suits.
 *   Values: 'warm-humid-subtropical' | 'warm-sub-humid-inland' |
 *           'mediterranean-winter-rainfall' | 'semi-arid' | 'cooler-highland'
 *
 * suitable_seasons: Planting seasons (SA calendar). Array of:
 *   'summer' | 'autumn' | 'winter' | 'spring'
 *
 * water_requirement: 'low' | 'moderate' | 'high'
 *   Matching the farm's water_access input:
 *     'rainfed'   → works well for 'low'; possible for 'moderate'; poor for 'high'
 *     'limited'   → works well for 'low' or 'moderate'; possible for 'high'
 *     'reliable'  → works for any
 *
 * soil_types      : Array of preferred soils.
 *   Values: 'sandy' | 'sandy-loam' | 'loam' | 'clay-loam' | 'clay' | 'shallow-rocky'
 *
 * management_level: 'low' | 'moderate' | 'high'
 *
 * farm_scale      : Array of suitable farm sizes.
 *   Values: 'micro' (<2ha) | 'small' (2–10ha) | 'medium' (10–50ha) | 'large' (50+ha)
 *
 * market_channels : Array of suitable markets.
 *   Values: 'fresh-local' | 'farmgate' | 'processor' | 'supermarket' | 'export'
 *
 * time_to_income  : 'fast' | 'medium' | 'long'
 *   fast   = harvest within ~3 months
 *   medium = 3–18 months
 *   long   = 18+ months (orchards, trees)
 *
 * frost_tolerance : 'low' | 'medium' | 'high'
 *   (How much frost the crop can withstand: low = frost-sensitive, high = frost-hardy)
 *
 * wind_tolerance  : 'low' | 'medium' | 'high'
 *
 * drainage_preference: 'poor' | 'moderate' | 'good'
 *   (What drainage the crop prefers, not what it tolerates)
 *
 * notes           : Short agronomic note shown on crop card
 * risks           : Array of risk strings shown on crop card
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CROPS = [
  // ═══════════════════════════════════════════════════════════
  // ANNUAL / SEASONAL CROPS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'maize',
    name: 'Maize',
    category: 'grain',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'semi-arid'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam', 'clay-loam'],
    management_level: 'moderate',
    farm_scale: ['small', 'medium', 'large'],
    market_channels: ['processor', 'farmgate'],
    time_to_income: 'fast',
    frost_tolerance: 'low',
    wind_tolerance: 'medium',
    drainage_preference: 'good',
    notes: 'A staple summer crop in KZN and the inland highveld. Performs best with adequate summer rainfall or supplemental irrigation. Suited to medium-large operations for processor markets.',
    risks: ['Armyworm pressure in wetter seasons', 'Price volatility in commodity markets', 'Storage infrastructure required for large volumes']
  },
  {
    id: 'dry-beans',
    name: 'Dry Beans',
    category: 'grain',
    duration_type: 'annual',
    climate_zones: ['warm-sub-humid-inland', 'cooler-highland', 'semi-arid'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['small', 'medium', 'large'],
    market_channels: ['processor', 'farmgate'],
    time_to_income: 'fast',
    frost_tolerance: 'low',
    wind_tolerance: 'medium',
    drainage_preference: 'good',
    notes: 'Nitrogen-fixing legume, good rotation crop after maize. Processed beans have stable demand. Sensitive to waterlogging; requires well-drained soils.',
    risks: ['Pod borer and bean fly pests', 'Hail damage at pod fill stage', 'Processor price negotiations can be tight']
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    category: 'vegetable',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'cooler-highland'],
    suitable_seasons: ['autumn', 'winter', 'spring'],
    water_requirement: 'moderate',
    soil_types: ['loam', 'clay-loam', 'sandy-loam'],
    management_level: 'moderate',
    farm_scale: ['micro', 'small', 'medium'],
    market_channels: ['fresh-local', 'farmgate', 'supermarket'],
    time_to_income: 'fast',
    frost_tolerance: 'medium',
    wind_tolerance: 'medium',
    drainage_preference: 'good',
    notes: 'A workhorse cool-season brassica. Strong demand in fresh local, informal, and supermarket channels. Consistent performer in KZN and inland temperate climates with moderate irrigation.',
    risks: ['Diamondback moth resistance to common insecticides', 'Market gluts common when supply peaks', 'Tip burn in high-heat summers']
  },
  {
    id: 'tomato',
    name: 'Tomato',
    category: 'vegetable',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'semi-arid'],
    suitable_seasons: ['spring', 'summer', 'autumn'],
    water_requirement: 'high',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'high',
    farm_scale: ['micro', 'small', 'medium'],
    market_channels: ['fresh-local', 'farmgate', 'supermarket', 'processor'],
    time_to_income: 'fast',
    frost_tolerance: 'low',
    wind_tolerance: 'low',
    drainage_preference: 'good',
    notes: 'High-value but demanding. Requires consistent irrigation, trellising, and active disease management. Strong returns in fresh and processor markets when managed well.',
    risks: ['Late blight and bacterial wilt in humid conditions', 'Price volatility when fresh market gluts', 'High input costs if under tunnel or drip']
  },
  {
    id: 'butternut',
    name: 'Butternut',
    category: 'vegetable',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'semi-arid'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam', 'sandy'],
    management_level: 'low',
    farm_scale: ['small', 'medium', 'large'],
    market_channels: ['fresh-local', 'farmgate', 'supermarket', 'processor'],
    time_to_income: 'fast',
    frost_tolerance: 'low',
    wind_tolerance: 'medium',
    drainage_preference: 'good',
    notes: 'Relatively low-input summer crop with good shelf life. Suits larger-scale production for processors or wholesale. Tolerates moderate water stress once established.',
    risks: ['Powdery mildew in late season', 'Market saturation in peak summer supply', 'Vine crops are difficult to mechanically harvest cleanly']
  },
  {
    id: 'onion',
    name: 'Onion',
    category: 'vegetable',
    duration_type: 'annual',
    climate_zones: ['warm-sub-humid-inland', 'semi-arid', 'cooler-highland'],
    suitable_seasons: ['autumn', 'winter', 'spring'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['small', 'medium', 'large'],
    market_channels: ['fresh-local', 'farmgate', 'supermarket'],
    time_to_income: 'medium',
    frost_tolerance: 'medium',
    wind_tolerance: 'medium',
    drainage_preference: 'good',
    notes: 'Key cool-season bulb crop. Prefers well-structured light soils and cool dry finishing conditions. SA has strong domestic demand; export to regional markets possible.',
    risks: ['Downy mildew in wet seasons', 'Precise irrigation management required for bulb sizing', 'Storage losses if curing is inadequate']
  },
  {
    id: 'spinach',
    name: 'Spinach / Swiss Chard',
    category: 'vegetable',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'cooler-highland'],
    suitable_seasons: ['autumn', 'winter', 'spring', 'summer'],
    water_requirement: 'moderate',
    soil_types: ['loam', 'clay-loam', 'sandy-loam'],
    management_level: 'low',
    farm_scale: ['micro', 'small'],
    market_channels: ['fresh-local', 'farmgate'],
    time_to_income: 'fast',
    frost_tolerance: 'medium',
    wind_tolerance: 'medium',
    drainage_preference: 'moderate',
    notes: 'Fast-turnover leafy crop, excellent for micro and small farms targeting informal markets. Multiple harvests per planting. Low capital requirement.',
    risks: ['Short shelf life requires regular supply-chain logistics', 'Susceptible to stem rot in waterlogged beds', 'Price competition from large-scale growers']
  },
  {
    id: 'green-pepper',
    name: 'Green Pepper',
    category: 'vegetable',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'high',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['micro', 'small', 'medium'],
    market_channels: ['fresh-local', 'farmgate', 'supermarket'],
    time_to_income: 'fast',
    frost_tolerance: 'low',
    wind_tolerance: 'low',
    drainage_preference: 'good',
    notes: 'Warm-season crop with consistent local demand. Responds well to drip irrigation and moderate fertility. Suits small-scale intensive production under cover or in open field.',
    risks: ['Phytophthora root rot in poorly drained sites', 'Aphid and mite pressure in hot weather', 'Requires wind protection in exposed sites']
  },
  {
    id: 'chilli',
    name: 'Chilli',
    category: 'vegetable',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'semi-arid'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['micro', 'small'],
    market_channels: ['fresh-local', 'farmgate', 'processor'],
    time_to_income: 'fast',
    frost_tolerance: 'low',
    wind_tolerance: 'low',
    drainage_preference: 'good',
    notes: 'Niche but growing market in fresh, dried, and processed formats. Suitable for small-scale diversification. Dried chilli has good shelf life and value density.',
    risks: ['Pepper mosaic virus from aphid vectors', 'Drying facilities required for processed product', 'Market linkages are key for consistent offtake']
  },
  {
    id: 'ginger',
    name: 'Ginger',
    category: 'spice',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical'],
    suitable_seasons: ['spring'],
    water_requirement: 'high',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['micro', 'small'],
    market_channels: ['fresh-local', 'farmgate', 'processor', 'export'],
    time_to_income: 'medium',
    frost_tolerance: 'low',
    wind_tolerance: 'low',
    drainage_preference: 'good',
    notes: 'Strong niche crop in KZN subtropical regions. High value per kilogram. Requires 8–10 months to mature. Frost-sensitive; suited to warm, well-watered coastal/lowland areas.',
    risks: ['Rhizome rot in poorly drained soils', 'High seed rhizome cost at establishment', 'Slow early growth leaves gaps in cash flow']
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    category: 'spice',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical'],
    suitable_seasons: ['spring'],
    water_requirement: 'high',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'low',
    farm_scale: ['micro', 'small'],
    market_channels: ['fresh-local', 'farmgate', 'processor'],
    time_to_income: 'medium',
    frost_tolerance: 'low',
    wind_tolerance: 'low',
    drainage_preference: 'good',
    notes: 'Growing demand in health food, powder, and processing markets. Similar cultural requirements to ginger but slightly lower management intensity. Best suited to KZN subtropical conditions.',
    risks: ['Rhizome rot in heavy soils', 'Long maturity cycle (8–9 months) affects cash flow', 'Processing infrastructure needed for powder/extract value-add']
  },
  {
    id: 'basil',
    name: 'Basil',
    category: 'herb',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['micro', 'small'],
    market_channels: ['fresh-local', 'farmgate', 'supermarket'],
    time_to_income: 'fast',
    frost_tolerance: 'low',
    wind_tolerance: 'low',
    drainage_preference: 'good',
    notes: 'Short-cycle high-value herb. Multiple harvests per planting. Strong urban fresh market and supermarket demand. Best grown in small-scale intensive beds with regular picking.',
    risks: ['Downy mildew and fusarium wilt common', 'Very short shelf life post-harvest', 'Market contracts preferred before large-scale production']
  },
  {
    id: 'coriander',
    name: 'Coriander',
    category: 'herb',
    duration_type: 'annual',
    climate_zones: ['warm-sub-humid-inland', 'cooler-highland', 'semi-arid'],
    suitable_seasons: ['autumn', 'winter', 'spring'],
    water_requirement: 'low',
    soil_types: ['sandy-loam', 'loam', 'sandy'],
    management_level: 'low',
    farm_scale: ['micro', 'small'],
    market_channels: ['fresh-local', 'farmgate'],
    time_to_income: 'fast',
    frost_tolerance: 'medium',
    wind_tolerance: 'medium',
    drainage_preference: 'good',
    notes: 'Fast-turnaround cool-season herb. Lower water demand than most vegetables. Very popular in SA informal and fresh markets. Bolt-prone in summer heat; plant in cooler months.',
    risks: ['Bolts rapidly in warm weather', 'Low per-unit value requires volume for commercial viability', 'Seed saving quality affects germination rates']
  },

  // ═══════════════════════════════════════════════════════════
  // PERENNIAL / ORCHARD / TREE CROPS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'tree-crop',
    duration_type: 'long-perennial',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam', 'clay-loam'],
    management_level: 'moderate',
    farm_scale: ['small', 'medium', 'large'],
    market_channels: ['fresh-local', 'supermarket', 'export'],
    time_to_income: 'long',
    frost_tolerance: 'low',
    wind_tolerance: 'low',
    drainage_preference: 'good',
    notes: 'High-value export crop well-suited to KZN subtropical areas. Sensitive to frost, wind, and waterlogging. Takes 3–4 years to first significant harvest. Strong global demand continues to grow.',
    risks: ['Phytophthora root rot is the primary soil health risk', 'Wind damage to flowers and fruit at critical stages', 'Long establishment period before return on investment']
  },
  {
    id: 'macadamia',
    name: 'Macadamia',
    category: 'tree-crop',
    duration_type: 'long-perennial',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland'],
    suitable_seasons: ['spring'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['medium', 'large'],
    market_channels: ['processor', 'export'],
    time_to_income: 'long',
    frost_tolerance: 'low',
    wind_tolerance: 'medium',
    drainage_preference: 'good',
    notes: 'SA is among the world\'s leading macadamia producers. Long-term, high-value nut crop. Requires significant capital outlay and 5–7 years to economic yield. Strong processor and export market.',
    risks: ['Very high establishment and waiting capital', 'Stinkbug is a major ongoing pest', 'Processor contract access is important before planting']
  },
  {
    id: 'banana',
    name: 'Banana',
    category: 'fruit',
    duration_type: 'short-perennial',
    climate_zones: ['warm-humid-subtropical'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'high',
    soil_types: ['loam', 'sandy-loam', 'clay-loam'],
    management_level: 'moderate',
    farm_scale: ['small', 'medium'],
    market_channels: ['fresh-local', 'farmgate', 'supermarket'],
    time_to_income: 'medium',
    frost_tolerance: 'low',
    wind_tolerance: 'low',
    drainage_preference: 'moderate',
    notes: 'Strong SA demand crop. Suited to warm, humid coastal lowlands. First bunch typically 12–18 months from planting. Wind protection is critical. Ratoon management extends production.',
    risks: ['Panama disease (Fusarium wilt) is a major soil-borne risk', 'Wind damage to leaves and bunches', 'Cold snaps significantly set back growth']
  },
  {
    id: 'litchi',
    name: 'Litchi',
    category: 'tree-crop',
    duration_type: 'long-perennial',
    climate_zones: ['warm-humid-subtropical'],
    suitable_seasons: ['autumn', 'spring'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['small', 'medium'],
    market_channels: ['fresh-local', 'supermarket', 'export'],
    time_to_income: 'long',
    frost_tolerance: 'low',
    wind_tolerance: 'low',
    drainage_preference: 'good',
    notes: 'Premium seasonal fruit with strong export potential. Suited to humid subtropical lowlands. Requires cooler dry spell to induce flowering. Takes 4–5 years to first harvest.',
    risks: ['Birds and fruit fly cause significant crop loss without netting', 'Very short post-harvest window for fresh market', 'Flowering disrupted by warm winter conditions']
  },
  {
    id: 'mango',
    name: 'Mango',
    category: 'tree-crop',
    duration_type: 'long-perennial',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'semi-arid'],
    suitable_seasons: ['spring'],
    water_requirement: 'low',
    soil_types: ['sandy-loam', 'loam', 'sandy'],
    management_level: 'low',
    farm_scale: ['small', 'medium', 'large'],
    market_channels: ['fresh-local', 'farmgate', 'processor', 'export'],
    time_to_income: 'long',
    frost_tolerance: 'low',
    wind_tolerance: 'medium',
    drainage_preference: 'good',
    notes: 'Drought-tolerant once established. Wide market channels from farmgate to export. Best in areas with a distinct dry season to aid flowering. Takes 3–5 years to first meaningful harvest.',
    risks: ['Anthracnose is the major post-harvest disease in humid areas', 'Alternate bearing tendency in some varieties', 'Fruit fly management essential for export certification']
  },
  {
    id: 'passionfruit',
    name: 'Passionfruit',
    category: 'fruit',
    duration_type: 'short-perennial',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland'],
    suitable_seasons: ['spring'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['micro', 'small', 'medium'],
    market_channels: ['fresh-local', 'farmgate', 'processor'],
    time_to_income: 'medium',
    frost_tolerance: 'low',
    wind_tolerance: 'low',
    drainage_preference: 'good',
    notes: 'Fast-bearing subtropical vine. First harvest typically within 8–12 months. Good for trellised systems on smaller farms. Pulp has strong processor demand; fresh fruit is premium.',
    risks: ['Woodiness virus spread by aphids significantly shortens productive life', 'Nematode damage in sandy soils', 'Plants typically need replanting after 3–4 years']
  },
  {
    id: 'citrus',
    name: 'Citrus',
    category: 'tree-crop',
    duration_type: 'long-perennial',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'semi-arid', 'mediterranean-winter-rainfall'],
    suitable_seasons: ['spring'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['medium', 'large'],
    market_channels: ['fresh-local', 'supermarket', 'processor', 'export'],
    time_to_income: 'long',
    frost_tolerance: 'medium',
    wind_tolerance: 'medium',
    drainage_preference: 'good',
    notes: 'SA\'s largest agricultural export. Diverse range of species (navels, lemons, soft citrus) suited to different climates. Significant infrastructure investment required for export compliance.',
    risks: ['Citrus greening (HLB) — no cure, monitoring critical', 'Export protocol compliance is complex and costly', 'Established orchard infrastructure required for economies of scale']
  },
  {
    id: 'guava',
    name: 'Guava',
    category: 'tree-crop',
    duration_type: 'short-perennial',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'semi-arid'],
    suitable_seasons: ['spring'],
    water_requirement: 'low',
    soil_types: ['sandy-loam', 'loam', 'sandy', 'clay-loam'],
    management_level: 'low',
    farm_scale: ['micro', 'small', 'medium'],
    market_channels: ['fresh-local', 'farmgate', 'processor'],
    time_to_income: 'medium',
    frost_tolerance: 'medium',
    wind_tolerance: 'medium',
    drainage_preference: 'moderate',
    notes: 'Hardy, drought-tolerant fruit tree with broad soil adaptability. Good for low-input systems. Processor demand for pulp is consistent. First harvest typically within 2–3 years.',
    risks: ['Fruit fly is the major pest requiring management', 'Market prices for fresh guava are highly variable', 'Invasive in some areas — check local regulations']
  },
  {
    id: 'moringa',
    name: 'Moringa',
    category: 'specialty',
    duration_type: 'short-perennial',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'semi-arid'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'low',
    soil_types: ['sandy', 'sandy-loam', 'loam'],
    management_level: 'low',
    farm_scale: ['micro', 'small'],
    market_channels: ['fresh-local', 'farmgate', 'processor'],
    time_to_income: 'medium',
    frost_tolerance: 'low',
    wind_tolerance: 'high',
    drainage_preference: 'good',
    notes: 'Fast-growing highly nutritious tree for leaf, seed, and pod production. Very low water requirement once established. Growing health and export market for dried powder. Fast to first leaf harvest.',
    risks: ['Limited formal market infrastructure in SA', 'Market education needed for mainstream buyers', 'Price volatility as a niche product']
  },
  {
    id: 'dragon-fruit',
    name: 'Dragon Fruit (Pitaya)',
    category: 'specialty',
    duration_type: 'short-perennial',
    climate_zones: ['warm-humid-subtropical', 'semi-arid'],
    suitable_seasons: ['spring'],
    water_requirement: 'low',
    soil_types: ['sandy', 'sandy-loam'],
    management_level: 'moderate',
    farm_scale: ['micro', 'small'],
    market_channels: ['fresh-local', 'supermarket', 'export'],
    time_to_income: 'medium',
    frost_tolerance: 'low',
    wind_tolerance: 'medium',
    drainage_preference: 'good',
    notes: 'Emerging premium fruit with growing SA urban market demand. Cactus-like plant requiring good drainage and warm temperatures. Trellising required. First fruit in 12–18 months.',
    risks: ['Very niche market with limited buyer depth in SA', 'High establishment cost for trellis systems', 'Sensitive to frost and waterlogging']
  },

  // ═══════════════════════════════════════════════════════════
  // ADDITIONAL HIGH-VALUE / DIVERSIFICATION CROPS
  // ═══════════════════════════════════════════════════════════
  {
    id: 'sweet-potato',
    name: 'Sweet Potato',
    category: 'root',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'semi-arid'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'low',
    soil_types: ['sandy', 'sandy-loam', 'loam'],
    management_level: 'low',
    farm_scale: ['micro', 'small', 'medium'],
    market_channels: ['fresh-local', 'farmgate', 'processor'],
    time_to_income: 'fast',
    frost_tolerance: 'low',
    wind_tolerance: 'high',
    drainage_preference: 'good',
    notes: 'High-nutrition root crop with strong informal and formal market demand. Drought-tolerant once established. Good for low-input systems. Nutritious slips are the planting material.',
    risks: ['Weevil is the primary storage pest', 'Bruising during harvest reduces shelf life', 'Market prices are highly seasonal']
  },
  {
    id: 'garlic',
    name: 'Garlic',
    category: 'vegetable',
    duration_type: 'annual',
    climate_zones: ['cooler-highland', 'warm-sub-humid-inland', 'semi-arid'],
    suitable_seasons: ['autumn', 'winter'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['micro', 'small'],
    market_channels: ['fresh-local', 'farmgate', 'processor'],
    time_to_income: 'medium',
    frost_tolerance: 'high',
    wind_tolerance: 'medium',
    drainage_preference: 'good',
    notes: 'High-value cool-season crop. SA imports significant volumes, creating opportunity for local production. Requires well-drained fertile soils and vernalisation for bulb development.',
    risks: ['Seed bulb cost is high and affects profitability', 'Fungal diseases in humid/wet conditions', 'Competing against cheap imported product']
  },
  {
    id: 'beetroot',
    name: 'Beetroot',
    category: 'vegetable',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'cooler-highland'],
    suitable_seasons: ['autumn', 'winter', 'spring'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam', 'clay-loam'],
    management_level: 'low',
    farm_scale: ['micro', 'small'],
    market_channels: ['fresh-local', 'farmgate', 'processor'],
    time_to_income: 'fast',
    frost_tolerance: 'medium',
    wind_tolerance: 'high',
    drainage_preference: 'moderate',
    notes: 'Versatile root vegetable with strong local demand and processor interest for pickled product. Low management intensity. Good for beginners and diversification into value-added.',
    risks: ['Cercospora leaf spot in hot, humid periods', 'Boron deficiency in some soils causes internal problems', 'Short shelf life once harvested without refrigeration']
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    category: 'vegetable',
    duration_type: 'annual',
    climate_zones: ['warm-humid-subtropical', 'warm-sub-humid-inland', 'semi-arid'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam', 'sandy'],
    management_level: 'low',
    farm_scale: ['small', 'medium'],
    market_channels: ['fresh-local', 'farmgate', 'processor'],
    time_to_income: 'fast',
    frost_tolerance: 'low',
    wind_tolerance: 'medium',
    drainage_preference: 'moderate',
    notes: 'Robust, space-intensive crop with good storage life post-harvest. Suitable for intercropping systems. Demand is strong in informal and urban fresh markets.',
    risks: ['Powdery mildew in late season', 'Large vine requires good spacing to manage disease', 'Lower value per kg than most vegetable crops']
  },
  {
    id: 'papaya',
    name: 'Papaya (Pawpaw)',
    category: 'fruit',
    duration_type: 'short-perennial',
    climate_zones: ['warm-humid-subtropical'],
    suitable_seasons: ['spring', 'summer'],
    water_requirement: 'moderate',
    soil_types: ['sandy-loam', 'loam'],
    management_level: 'moderate',
    farm_scale: ['micro', 'small'],
    market_channels: ['fresh-local', 'farmgate', 'supermarket'],
    time_to_income: 'medium',
    frost_tolerance: 'low',
    wind_tolerance: 'low',
    drainage_preference: 'good',
    notes: 'Fast-bearing tropical fruit tree with first harvest within 9–12 months. Strong local demand year-round. Must be grown in frost-free, warm, humid sites with well-drained soils.',
    risks: ['Papaya ringspot virus is widespread and devastating', 'Wind easily uproots shallow-rooted plants', 'Requires male and female plants for production (unless hermaphrodite varieties used)']
  }
];

/**
 * Region archetypes for v1 geolocation lookup.
 * Map lat/lng to a region by matching province/area keywords or coordinate ranges.
 * Future versions can replace this with a proper GIS lookup.
 */
export const REGION_ARCHETYPES = {
  'warm-humid-subtropical': {
    label: 'Warm Humid Subtropical',
    description: 'Hot, humid summers; mild winters. Year-round rainfall with summer peak.',
    examples: 'KwaZulu-Natal coast, Mpumalanga lowveld, Limpopo lowveld',
    lat_range: [-32, -22],
    lon_range: [28, 33]
  },
  'warm-sub-humid-inland': {
    label: 'Warm Sub-Humid Inland',
    description: 'Summer rainfall, hot days, mild winters. Lower humidity than coastal subtropical.',
    examples: 'Highveld, KZN Midlands, inland Mpumalanga',
    lat_range: [-30, -24],
    lon_range: [26, 32]
  },
  'mediterranean-winter-rainfall': {
    label: 'Mediterranean / Winter Rainfall',
    description: 'Dry summers, cool-wet winters. Suited to winter crops and perennials adapted to dry summers.',
    examples: 'Western Cape, parts of Northern Cape',
    lat_range: [-35, -29],
    lon_range: [17, 22]
  },
  'semi-arid': {
    label: 'Semi-Arid',
    description: 'Low, variable rainfall. Irrigation usually essential. Hot summers.',
    examples: 'Limpopo bushveld, Northern Cape, Karoo periphery',
    lat_range: [-31, -22],
    lon_range: [19, 30]
  },
  'cooler-highland': {
    label: 'Cooler Highland',
    description: 'High altitude. Cold winters with possible frost. Moderate summer rainfall.',
    examples: 'Drakensberg foothills, Lesotho border areas, Eastern Highlands',
    lat_range: [-33, -26],
    lon_range: [26, 31]
  }
};

/**
 * Detect region archetype from lat/lng.
 * Uses simple heuristics based on SA geography.
 * Returns an archetype key from REGION_ARCHETYPES.
 */
export function detectRegionFromCoords(lat, lng) {
  const absLat = Math.abs(lat);

  // Western Cape: winter rainfall / mediterranean
  if (lng < 22 && absLat > 33) return 'mediterranean-winter-rainfall';
  if (lng < 22.5 && absLat > 32) return 'mediterranean-winter-rainfall';

  // KZN coast: warm humid subtropical
  if (lng > 30 && absLat > 28 && absLat < 31) return 'warm-humid-subtropical';

  // Limpopo lowveld: warm humid subtropical / semi-arid
  if (lat > -25 && lng > 30) return 'warm-humid-subtropical';
  if (lat > -25 && lng < 30) return 'semi-arid';

  // Highveld / inland plateau
  if (absLat > 25 && absLat < 29 && lng > 25 && lng < 31) return 'warm-sub-humid-inland';

  // Drakensberg / highland
  if (absLat > 28 && absLat < 32 && lng > 27 && lng < 30) return 'cooler-highland';

  // Northern Cape / Karoo: semi-arid
  if (lng < 25 && absLat > 27) return 'semi-arid';

  // Default fallback for unclear positions
  return 'warm-sub-humid-inland';
}
