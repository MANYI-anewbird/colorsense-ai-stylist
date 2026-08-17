/**
 * Standalone calibration runner (no dependencies)
 * Run with: node run-calibration-standalone.mjs
 */

// Copy of essential functions from color-utils.ts
function rgbToLab(r, g, b) {
  const srgbToLinear = (u) =>
    u > 0.04045 ? Math.pow((u + 0.055) / 1.055, 2.4) : u / 12.92;

  const rr = srgbToLinear(r / 255);
  const gg = srgbToLinear(g / 255);
  const bb = srgbToLinear(b / 255);

  const X = rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375;
  const Y = rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750;
  const Z = rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041;

  let x = X / 0.95047;
  let y = Y / 1.0;
  let z = Z / 1.08883;

  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;
  const f = (t) => (t > epsilon ? Math.cbrt(t) : (kappa * t + 16) / 116);

  x = f(x);
  y = f(y);
  z = f(z);

  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const b_val = 200 * (y - z);

  return { l, a, b: b_val };
}

function hexToLab(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lab = rgbToLab(r, g, b);
  return { L: lab.l, a: lab.a, b: lab.b };
}

// Helper functions
function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function ramp(x, x0, x1) {
  if (x <= x0) return 0;
  if (x >= x1) return 1;
  return (x - x0) / (x1 - x0);
}

function invRamp(x, x0, x1) {
  return 1 - ramp(x, x0, x1);
}

function peak(x, lo, hi) {
  const PEAK_EDGE_WIDTH = 0.1;
  if (x >= lo && x <= hi) return 1;
  if (x < lo) {
    return ramp(x, lo - PEAK_EDGE_WIDTH, lo);
  }
  return invRamp(x, hi, hi + PEAK_EDGE_WIDTH);
}

// Default config (from color-utils.ts) - Updated with Keff
const DEFAULT_CONFIG = {
  wb: 15,
  C_ref: 50,
  V_K0: 0.45, // Lower value threshold for clarity ramp
  V_K1: 0.85, // Upper value threshold for clarity ramp
  V_FLOOR: 0.35, // Minimum Vscale value (soft attenuation floor)
  K_mid: 0.45, // Midpoint for pClear sigmoid
  K_bw: 0.12, // Bandwidth for pClear sigmoid
  springK0: 0.0, // Lower clarity threshold for Spring
  springK1: 0.5, // Upper clarity threshold for Spring
  autumnInvK0: 0.0, // Lower inverse clarity threshold for Autumn
  autumnInvK1: 0.5, // Upper inverse clarity threshold for Autumn
  C_bright0: 45,
  C_bright1: 60,
  springV: { lo: 0.62, hi: 0.92 }, // Tightened to exclude mid/low value
  autumnV: { lo: 0.35, hi: 0.70 },
  summerV: { lo: 0.55, hi: 0.90 },
  winterV: { lo: 0.30, hi: 0.70 },
  springLightV: { lo: 0.70, hi: 0.90 },
  springLightW: { lo: 0.55, hi: 0.75 },
  springLightK: { lo: 0.35, hi: 0.85 },
  springTrueW: { lo: 0.65, hi: 0.95 },
  springTrueV: { lo: 0.50, hi: 0.80 },
  springTrueK: { lo: 0.30, hi: 0.75 },
  springBrightK: { lo: 0.65, hi: 0.90 },
  springBrightV: { lo: 0.45, hi: 0.80 },
  autumnSoftK: { lo: 0.45, hi: 0.70 },
  autumnSoftV: { lo: 0.45, hi: 0.75 },
  autumnSoftW: { lo: 0.55, hi: 0.85 },
  autumnTrueW: { lo: 0.65, hi: 0.95 },
  autumnTrueV: { lo: 0.40, hi: 0.70 },
  autumnTrueK: { lo: 0.25, hi: 0.60 },
  autumnDeepV: { lo: 0.35, hi: 0.55 },
  autumnDeepW: { lo: 0.60, hi: 0.95 },
  autumnDeepK: { lo: 0.25, hi: 0.65 },
  summerLightV: { lo: 0.70, hi: 0.92 },
  summerLightW: { lo: 0.35, hi: 0.55 },
  summerLightK: { lo: 0.45, hi: 0.70 },
  summerTrueW: { lo: 0.20, hi: 0.45 },
  summerTrueV: { lo: 0.55, hi: 0.85 },
  summerTrueK: { lo: 0.40, hi: 0.70 },
  summerSoftK: { lo: 0.35, hi: 0.60 },
  summerSoftV: { lo: 0.45, hi: 0.80 },
  summerSoftW: { lo: 0.25, hi: 0.55 },
  winterBrightK: { lo: 0.65, hi: 0.90 },
  winterBrightW: { lo: 0.35, hi: 0.55 },
  winterTrueW: { lo: 0.10, hi: 0.40 },
  winterTrueV: { lo: 0.35, hi: 0.70 },
  winterTrueK: { lo: 0.45, hi: 0.85 },
  winterDeepV: { lo: 0.30, hi: 0.50 },
  winterDeepW: { lo: 0.10, hi: 0.40 },
  winterDeepK: { lo: 0.45, hi: 0.85 },
};

// Classification function (simplified version)
function classifyColorLAB(lab, config = DEFAULT_CONFIG) {
  const L = lab.L;
  const a = lab.a;
  const b = lab.b;
  
  const C = Math.sqrt(a * a + b * b);
  const V = L / 100;
  const W = clamp01(1 / (1 + Math.exp(-b / config.wb)));
  
  // Base clarity: normalized chroma
  const K0 = clamp01(C / config.C_ref);
  
  // Value gate: ramp function for value-based attenuation
  const Vgate = ramp(V, config.V_K0, config.V_K1);
  
  // Value scale: soft attenuation with floor (never zero)
  // Vscale ranges from V_FLOOR (when V < V_K0) to 1.0 (when V >= V_K1)
  const Vscale = config.V_FLOOR + (1 - config.V_FLOOR) * Vgate;
  
  // Effective clarity: combines chroma-based clarity with soft value attenuation
  // Keff is reduced for low-value colors but never hard-zero
  let Keff = K0 * Vscale;
  
  // Add Keff floor for vivid warm colors to prevent them from being treated as soft
  // High chroma + high warmth should maintain minimum clarity
  const C_norm = clamp01(C / 100);
  const K_floor = 0.35 + 0.30 * C_norm * W;
  Keff = Math.max(Keff, K_floor);
  
  // Compute pClear (probability of clear vs soft) from Keff
  const pClear = clamp01(1 / (1 + Math.exp(-(Keff - config.K_mid) / config.K_bw)));
  const pWarm = W; // pWarm is just W
  
  // Stage 1: Compute 4 family raw scores using pWarm and pClear
  const springRaw = pWarm * pClear * (0.7 + 0.3 * V);
  const autumnRaw = pWarm * (1 - pClear) * (0.8 + 0.2 * (1 - V));
  const winterRaw = (1 - pWarm) * pClear * (0.7 + 0.3 * (1 - V));
  const summerRaw = (1 - pWarm) * (1 - pClear) * (0.8 + 0.2 * V);
  
  // Normalize family scores
  const EPS = 1e-10;
  const familySum = springRaw + autumnRaw + winterRaw + summerRaw;
  const familyScores = {
    spring: springRaw / Math.max(familySum, EPS),
    autumn: autumnRaw / Math.max(familySum, EPS),
    winter: winterRaw / Math.max(familySum, EPS),
    summer: summerRaw / Math.max(familySum, EPS),
  };
  
  // Use normalized family scores directly as probabilities
  const familyProbs = familyScores;
  
  const family = Object.entries(familyProbs).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  // Stage 2: Subseason scores
  const subseasonScores = {
    'spring-light': 0, 'spring-true': 0, 'spring-bright': 0,
    'summer-light': 0, 'summer-true': 0, 'summer-soft': 0,
    'autumn-soft': 0, 'autumn-true': 0, 'autumn-deep': 0,
    'winter-bright': 0, 'winter-true': 0, 'winter-deep': 0,
  };
  
  if (family === 'spring') {
    subseasonScores['spring-light'] = ramp(V, config.springLightV.lo, config.springLightV.hi) * 
                                      ramp(W, config.springLightW.lo, config.springLightW.hi) * 
                                      peak(Keff, config.springLightK.lo, config.springLightK.hi);
    subseasonScores['spring-true'] = peak(W, config.springTrueW.lo, config.springTrueW.hi) * 
                                     peak(V, config.springTrueV.lo, config.springTrueV.hi) * 
                                     peak(Keff, config.springTrueK.lo, config.springTrueK.hi);
    subseasonScores['spring-bright'] = ramp(C, config.C_bright0, config.C_bright1) * 
                                      ramp(Keff, config.springBrightK.lo, config.springBrightK.hi) * 
                                      peak(V, config.springBrightV.lo, config.springBrightV.hi);
  } else if (family === 'autumn') {
    subseasonScores['autumn-soft'] = invRamp(Keff, config.autumnSoftK.lo, config.autumnSoftK.hi) * 
                                     peak(V, config.autumnSoftV.lo, config.autumnSoftV.hi) * 
                                     peak(W, config.autumnSoftW.lo, config.autumnSoftW.hi);
    subseasonScores['autumn-true'] = peak(W, config.autumnTrueW.lo, config.autumnTrueW.hi) * 
                                    peak(V, config.autumnTrueV.lo, config.autumnTrueV.hi) * 
                                    peak(Keff, config.autumnTrueK.lo, config.autumnTrueK.hi);
    subseasonScores['autumn-deep'] = invRamp(V, config.autumnDeepV.lo, config.autumnDeepV.hi) * 
                                    peak(W, config.autumnDeepW.lo, config.autumnDeepW.hi) * 
                                    peak(Keff, config.autumnDeepK.lo, config.autumnDeepK.hi);
  } else if (family === 'summer') {
    subseasonScores['summer-light'] = ramp(V, config.summerLightV.lo, config.summerLightV.hi) * 
                                      invRamp(W, config.summerLightW.lo, config.summerLightW.hi) * 
                                      invRamp(Keff, config.summerLightK.lo, config.summerLightK.hi);
    subseasonScores['summer-true'] = invRamp(W, config.summerTrueW.lo, config.summerTrueW.hi) * 
                                    peak(V, config.summerTrueV.lo, config.summerTrueV.hi) * 
                                    invRamp(Keff, config.summerTrueK.lo, config.summerTrueK.hi);
    subseasonScores['summer-soft'] = invRamp(Keff, config.summerSoftK.lo, config.summerSoftK.hi) * 
                                     peak(V, config.summerSoftV.lo, config.summerSoftV.hi) * 
                                     invRamp(W, config.summerSoftW.lo, config.summerSoftW.hi);
  } else if (family === 'winter') {
    subseasonScores['winter-bright'] = ramp(C, config.C_bright0, config.C_bright1) * 
                                      ramp(Keff, config.winterBrightK.lo, config.winterBrightK.hi) * 
                                      invRamp(W, config.winterBrightW.lo, config.winterBrightW.hi);
    subseasonScores['winter-true'] = invRamp(W, config.winterTrueW.lo, config.winterTrueW.hi) * 
                                    peak(V, config.winterTrueV.lo, config.winterTrueV.hi) * 
                                    peak(Keff, config.winterTrueK.lo, config.winterTrueK.hi);
    subseasonScores['winter-deep'] = invRamp(V, config.winterDeepV.lo, config.winterDeepV.hi) * 
                                    invRamp(W, config.winterDeepW.lo, config.winterDeepW.hi) * 
                                    peak(Keff, config.winterDeepK.lo, config.winterDeepK.hi);
  }
  
  // Normalize subseasons
  const familySubseasons = 
    family === 'spring' ? ['spring-light', 'spring-true', 'spring-bright'] :
    family === 'autumn' ? ['autumn-soft', 'autumn-true', 'autumn-deep'] :
    family === 'summer' ? ['summer-light', 'summer-true', 'summer-soft'] :
    ['winter-bright', 'winter-true', 'winter-deep'];
  
  const EPS_SUBSEASON = 1e-6;
  const maxSubScore = Math.max(...familySubseasons.map(s => subseasonScores[s]));
  
  let season12;
  let season12Probs;
  let isBorderline = false;
  let isFallbackUsed = false;
  let fallbackRule = null;
  let reason = '';
  
  if (maxSubScore <= EPS_SUBSEASON) {
    // Fallback: all subseason scores are zero or too small
    // Use fallback rules based on L and pClear
    isFallbackUsed = true;
    
    if (family === 'spring') {
      if (L >= 78) {
        season12 = 'spring-light';
        fallbackRule = 'SPRING_L>=78=>LIGHT';
        reason = 'High lightness → Spring Light';
      } else if (pClear >= 0.75) {
        season12 = 'spring-bright';
        fallbackRule = 'SPRING_pClear>=0.75=>BRIGHT';
        reason = 'High clarity → Spring Bright';
      } else {
        season12 = 'spring-true';
        fallbackRule = 'SPRING_DEFAULT=>TRUE';
        reason = 'Moderate features → Spring True';
      }
    } else if (family === 'summer') {
      if (L >= 78) {
        season12 = 'summer-light';
        fallbackRule = 'SUMMER_L>=78=>LIGHT';
        reason = 'High lightness → Summer Light';
      } else if (pClear <= 0.35) {
        season12 = 'summer-soft';
        fallbackRule = 'SUMMER_pClear<=0.35=>SOFT';
        reason = 'Low clarity → Summer Soft';
      } else {
        season12 = 'summer-true';
        fallbackRule = 'SUMMER_DEFAULT=>TRUE';
        reason = 'Moderate features → Summer True';
      }
    } else if (family === 'autumn') {
      if (L <= 45) {
        season12 = 'autumn-deep';
        fallbackRule = 'AUTUMN_L<=45=>DEEP';
        reason = 'Low lightness → Autumn Deep';
      } else if (pClear <= 0.35) {
        season12 = 'autumn-soft';
        fallbackRule = 'AUTUMN_pClear<=0.35=>SOFT';
        reason = 'Low clarity → Autumn Soft';
      } else {
        season12 = 'autumn-true';
        fallbackRule = 'AUTUMN_DEFAULT=>TRUE';
        reason = 'Moderate features → Autumn True';
      }
    } else { // winter
      if (L <= 45) {
        season12 = 'winter-deep';
        fallbackRule = 'WINTER_L<=45=>DEEP';
        reason = 'Low lightness → Winter Deep';
      } else if (pClear >= 0.75) {
        season12 = 'winter-bright';
        fallbackRule = 'WINTER_pClear>=0.75=>BRIGHT';
        reason = 'High clarity → Winter Bright';
      } else {
        season12 = 'winter-true';
        fallbackRule = 'WINTER_DEFAULT=>TRUE';
        reason = 'Moderate features → Winter True';
      }
    }
    
    // Set probabilities with heuristic proportions for fallback
    season12Probs = {};
    familySubseasons.forEach(s => {
      if (s === season12) {
        season12Probs[s] = 0.6; // Primary gets 60%
      } else {
        // Distribute remaining 40% among other two
        season12Probs[s] = 0.2;
      }
    });
    // Normalize to sum to 1.0
    const fallbackSum = Object.values(season12Probs).reduce((sum, p) => sum + p, 0);
    familySubseasons.forEach(s => {
      season12Probs[s] = season12Probs[s] / fallbackSum;
    });
  } else {
    // Normal case: use softmax on subseason scores
    const subseasonLogits = familySubseasons.map(s => subseasonScores[s]);
    const maxSubseasonLogit = Math.max(...subseasonLogits);
    const expSubseasonScores = subseasonLogits.map(s => Math.exp(s - maxSubseasonLogit));
    const sumExpSubseason = expSubseasonScores.reduce((sum, e) => sum + e, 0);
    
    season12Probs = {};
    familySubseasons.forEach((season, idx) => {
      season12Probs[season] = expSubseasonScores[idx] / sumExpSubseason;
    });
    
    // Pick top season12
    season12 = familySubseasons.reduce((a, b) => season12Probs[a] > season12Probs[b] ? a : b);
    
    // Check if borderline (top1 - top2 < 0.06)
    const sortedProbs = familySubseasons
      .map(s => ({ season: s, prob: season12Probs[s] }))
      .sort((a, b) => b.prob - a.prob);
    if (sortedProbs.length >= 2) {
      isBorderline = (sortedProbs[0].prob - sortedProbs[1].prob) < 0.06;
    }
    
    // Non-fallback reason
    reason = 'Closest match by color features';
  }
  
  // Top 3
  const allSeasons = [
    'spring-light', 'spring-true', 'spring-bright',
    'summer-light', 'summer-true', 'summer-soft',
    'autumn-soft', 'autumn-true', 'autumn-deep',
    'winter-bright', 'winter-true', 'winter-deep',
  ];
  
  const allSeasonProbs = {};
  allSeasons.forEach(season => {
    const seasonFamily = season.split('-')[0];
    allSeasonProbs[season] = familyProbs[seasonFamily] * 
      (familySubseasons.includes(season) ? season12Probs[season] : 0);
  });
  
  const top3 = allSeasons
    .map(season => ({ season, probability: allSeasonProbs[season] }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);
  
  // Calculate confidence metrics from top3
  const top1Prob = top3[0]?.probability ?? 0;
  const top2Prob = top3[1]?.probability ?? 0;
  const margin = top1Prob - top2Prob;
  
  const confidence = {
    top1: top1Prob,
    top2: top2Prob,
    margin,
    isBorderline,
  };
  
  return {
    family,
    familyProbs,
    season12,
    season12Probs: allSeasonProbs,
    top3,
    isFallbackUsed,
    fallbackRule: fallbackRule ?? undefined,
    reason,
    confidence,
    debug: { L, a, b, C, W, V, K0, Vgate, Vscale, Keff, K: Keff, pClear, familySumBeforeNorm: familySum, familyScores, subseasonScores, isBorderline, fallback: { used: isFallbackUsed, rule: fallbackRule } },
  };
}

// Anchor colors
const ANCHORS = [
  { hex: '#FEA176', expected: 'spring-light', family: 'spring' },
  { hex: '#FFD4A3', expected: 'spring-light', family: 'spring' },
  { hex: '#FFBE00', expected: 'spring-true', family: 'spring' },
  { hex: '#FF8C42', expected: 'spring-true', family: 'spring' },
  { hex: '#FF0801', expected: 'spring-bright', family: 'spring' },
  { hex: '#00FF41', expected: 'spring-bright', family: 'spring' },
  { hex: '#E8D5C4', expected: 'summer-light', family: 'summer' },
  { hex: '#D4E8F0', expected: 'summer-light', family: 'summer' },
  { hex: '#8FA3B8', expected: 'summer-true', family: 'summer' },
  { hex: '#B8A8A8', expected: 'summer-true', family: 'summer' },
  { hex: '#C4B5A8', expected: 'summer-soft', family: 'summer' },
  { hex: '#A8B8C4', expected: 'summer-soft', family: 'summer' },
  { hex: '#B8A088', expected: 'autumn-soft', family: 'autumn' },
  { hex: '#A88C70', expected: 'autumn-soft', family: 'autumn' },
  { hex: '#B37256', expected: 'autumn-true', family: 'autumn' },
  { hex: '#D4A070', expected: 'autumn-true', family: 'autumn' },
  { hex: '#8C5C42', expected: 'autumn-deep', family: 'autumn' },
  { hex: '#704228', expected: 'autumn-deep', family: 'autumn' },
  { hex: '#00A2FF', expected: 'winter-bright', family: 'winter' },
  { hex: '#FF0041', expected: 'winter-bright', family: 'winter' },
  { hex: '#4A5C8C', expected: 'winter-true', family: 'winter' },
  { hex: '#5C2842', expected: 'winter-true', family: 'winter' },
  { hex: '#282842', expected: 'winter-deep', family: 'winter' },
  { hex: '#421828', expected: 'winter-deep', family: 'winter' },
];

// Evaluation
function evaluateConfig(config) {
  let correctCount = 0;
  const failures = [];
  
  for (const anchor of ANCHORS) {
    const lab = hexToLab(anchor.hex);
    const result = classifyColorLAB(lab, config);
    
    const correct = result.season12 === anchor.expected;
    const familyCorrect = result.family === anchor.family;
    
    if (!correct) {
      failures.push({
        hex: anchor.hex,
        expected: anchor.expected,
        got: result.season12,
        familyCorrect,
        confidence: result.season12Probs[result.season12],
        top3: result.top3,
      });
    } else {
      correctCount++;
    }
  }
  
  return { accuracy: correctCount / ANCHORS.length, correctCount, totalCount: ANCHORS.length, failures };
}

// Parameter sweep (expanded to include new parameters)
function parameterSweep() {
  const results = [];
  let bestAccuracy = 0;
  let bestConfig = DEFAULT_CONFIG;
  
  console.log('Running expanded parameter sweep (coarse first, then fine):\n');
  console.log('Phase 1: Coarse sweep (wb, C_ref, V_K0, V_K1, V_FLOOR, springVlo)');
  console.log('Phase 2: Fine sweep around best (springK0, springK1)\n');
  
  // Phase 1: Coarse sweep (wb, C_ref, V_K0, V_K1, V_FLOOR, springVlo)
  console.log('Phase 1: Coarse sweep...');
  let phase1Best = { accuracy: 0, config: DEFAULT_CONFIG, params: {} };
  
  for (let wb = 10; wb <= 20; wb += 2) {
    for (let C_ref = 40; C_ref <= 70; C_ref += 5) {
      for (let V_K0 = 0.40; V_K0 <= 0.50; V_K0 += 0.05) {
        for (let V_K1 = 0.80; V_K1 <= 0.90; V_K1 += 0.05) {
          for (let V_FLOOR = 0.25; V_FLOOR <= 0.40; V_FLOOR += 0.05) {
            for (let springVlo = 0.58; springVlo <= 0.70; springVlo += 0.04) {
              const config = {
                ...DEFAULT_CONFIG,
                wb,
                C_ref,
                V_K0,
                V_K1,
                V_FLOOR,
                springV: { lo: springVlo, hi: DEFAULT_CONFIG.springV.hi },
              };
              
              const { accuracy } = evaluateConfig(config);
              results.push({ wb, C_ref, V_K0, V_K1, V_FLOOR, springVlo, springK0: config.springK0, springK1: config.springK1, accuracy });
              
              if (accuracy > phase1Best.accuracy) {
                phase1Best = { accuracy, config, params: { wb, C_ref, V_K0, V_K1, V_FLOOR, springVlo } };
              }
            }
          }
        }
      }
    }
  }
  
  console.log(`Phase 1 best: ${(phase1Best.accuracy * 100).toFixed(1)}% (wb=${phase1Best.params.wb}, C_ref=${phase1Best.params.C_ref}, V_K0=${phase1Best.params.V_K0}, V_K1=${phase1Best.params.V_K1}, V_FLOOR=${phase1Best.params.V_FLOOR}, springVlo=${phase1Best.params.springVlo})\n`);
  
  // Phase 2: Fine sweep around best (springK0, springK1)
  console.log('Phase 2: Fine sweep (springK0, springK1)...');
  const baseConfig = phase1Best.config;
  
  for (let springK0 = 0.0; springK0 <= 0.2; springK0 += 0.05) {
    for (let springK1 = 0.4; springK1 <= 0.6; springK1 += 0.05) {
      const config = {
        ...baseConfig,
        springK0,
        springK1,
      };
      
      const { accuracy } = evaluateConfig(config);
      results.push({ 
        wb: baseConfig.wb, 
        C_ref: baseConfig.C_ref, 
        V_K0: baseConfig.V_K0, 
        V_K1: baseConfig.V_K1, 
        springVlo: baseConfig.springV.lo, 
        springK0, 
        springK1, 
        accuracy 
      });
      
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestConfig = config;
      }
    }
  }
  
  console.log('\n');
  results.sort((a, b) => b.accuracy - a.accuracy);
  const top5 = results.slice(0, 5);
  
  return { bestConfig, bestAccuracy, top5 };
}

// Generate CSV
function generateCSV(config, name) {
  const lines = ['hex,L,a,b,C,W,V,K0,Vgate,Vscale,Keff,pClear,familySumBeforeNorm,familyScores,chosenFamily,subScores,season12,top3'];
  
  for (const anchor of ANCHORS) {
    const lab = hexToLab(anchor.hex);
    const result = classifyColorLAB(lab, config);
    
    const familyScores = `spring:${result.debug.familyScores.spring.toFixed(3)},autumn:${result.debug.familyScores.autumn.toFixed(3)},summer:${result.debug.familyScores.summer.toFixed(3)},winter:${result.debug.familyScores.winter.toFixed(3)}`;
    const subScores = result.debug.subseasonScores;
    const familySubseasons = 
      result.family === 'spring' ? ['spring-light', 'spring-true', 'spring-bright'] :
      result.family === 'autumn' ? ['autumn-soft', 'autumn-true', 'autumn-deep'] :
      result.family === 'summer' ? ['summer-light', 'summer-true', 'summer-soft'] :
      ['winter-bright', 'winter-true', 'winter-deep'];
    const subScoresStr = familySubseasons.map(s => `${s}:${subScores[s].toFixed(3)}`).join(',');
    const top3Str = result.top3.map(t => `${t.season}:${(t.probability * 100).toFixed(1)}%`).join(';');
    
    lines.push([
      anchor.hex,
      result.debug.L.toFixed(1),
      result.debug.a.toFixed(1),
      result.debug.b.toFixed(1),
      result.debug.C.toFixed(2),
      result.debug.W.toFixed(3),
      result.debug.V.toFixed(3),
      result.debug.K0.toFixed(3),
      result.debug.Vgate.toFixed(3),
      result.debug.Vscale.toFixed(3),
      result.debug.Keff.toFixed(3),
      result.debug.pClear.toFixed(3),
      result.debug.familySumBeforeNorm.toFixed(3),
      familyScores,
      result.family,
      subScoresStr,
      result.season12,
      top3Str,
    ].join(','));
  }
  
  return lines.join('\n');
}

// Main execution
console.log('=== 1. DEFAULT Config Test ===\n');
const defaultResults = evaluateConfig(DEFAULT_CONFIG);
console.log(`Accuracy: ${(defaultResults.accuracy * 100).toFixed(1)}% (${defaultResults.correctCount}/${defaultResults.totalCount})\n`);

if (defaultResults.failures.length > 0) {
  console.log(`Failing anchors (${defaultResults.failures.length}):`);
  defaultResults.failures.forEach(f => {
    const top3Str = f.top3.map(t => `${t.season}:${(t.probability * 100).toFixed(1)}%`).join(';');
    console.log(`  ${f.hex}: expected ${f.expected}, got ${f.got} (family: ${f.familyCorrect ? '✓' : '✗'}), confidence: ${(f.confidence * 100).toFixed(1)}%, top3: ${top3Str}`);
  });
}

console.log('\n=== 2. Parameter Sweep ===\n');
const sweepResults = parameterSweep();
console.log(`\nBest config: wb=${sweepResults.bestConfig.wb}, C_ref=${sweepResults.bestConfig.C_ref}`);
console.log(`Best accuracy: ${(sweepResults.bestAccuracy * 100).toFixed(1)}%\n`);
console.log('Top 5 configurations:');
sweepResults.top5.forEach((r, i) => {
  console.log(`  ${i + 1}. wb=${r.wb}, C_ref=${r.C_ref}: ${(r.accuracy * 100).toFixed(1)}%`);
});

console.log('\n=== 3. BEST Config Test ===\n');
const bestResults = evaluateConfig(sweepResults.bestConfig);
console.log(`Accuracy: ${(bestResults.accuracy * 100).toFixed(1)}% (${bestResults.correctCount}/${bestResults.totalCount})\n`);

if (bestResults.failures.length > 0) {
  console.log(`Remaining failures (${bestResults.failures.length}):`);
  bestResults.failures.forEach(f => {
    const top3Str = f.top3.map(t => `${t.season}:${(t.probability * 100).toFixed(1)}%`).join(';');
    console.log(`  ${f.hex}: expected ${f.expected}, got ${f.got} (family: ${f.familyCorrect ? '✓' : '✗'}), confidence: ${(f.confidence * 100).toFixed(1)}%, top3: ${top3Str}`);
  });
  
  const wrongFamily = bestResults.failures.filter(f => !f.familyCorrect);
  const wrongSubseason = bestResults.failures.filter(f => f.familyCorrect);
  
  console.log(`\n=== Failure Categorization ===`);
  console.log(`Category A (Wrong Family): ${wrongFamily.length}`);
  wrongFamily.forEach(f => console.log(`  ${f.hex}: ${f.expected} → ${f.got}`));
  
  console.log(`\nCategory B (Correct Family, Wrong Subseason): ${wrongSubseason.length}`);
  wrongSubseason.forEach(f => console.log(`  ${f.hex}: ${f.expected} → ${f.got}`));
}

// Generate CSV files
console.log('\n=== 4. Generating CSV Files ===\n');
const defaultCSV = generateCSV(DEFAULT_CONFIG, 'default');
const bestCSV = generateCSV(sweepResults.bestConfig, 'best');

try {
  const fs = await import('fs');
  const path = await import('path');
  const defaultPath = path.join(process.cwd(), 'docs/calibration/season-anchors-snapshot-default.csv');
  const bestPath = path.join(process.cwd(), 'docs/calibration/season-anchors-snapshot-best.csv');
  
  fs.writeFileSync(defaultPath, defaultCSV, 'utf-8');
  fs.writeFileSync(bestPath, bestCSV, 'utf-8');
  
  console.log(`Saved: ${defaultPath}`);
  console.log(`Saved: ${bestPath}`);
} catch (e) {
  console.log('\nCould not save files, outputting CSV to console:\n');
  console.log('--- DEFAULT config CSV ---');
  console.log(defaultCSV);
  console.log('\n--- BEST config CSV ---');
  console.log(bestCSV);
}
