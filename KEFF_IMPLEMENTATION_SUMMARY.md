# Keff (Effective Clarity) Implementation Summary

## Changes Implemented

### 1. Replaced K with Keff (Effective Clarity)

**Old approach:**
```typescript
K = clamp01(C / C_ref)  // Too naive - makes earthy browns look "clear"
```

**New approach:**
```typescript
K0 = clamp01(C / C_ref)  // Base clarity from chroma
Vgate = ramp(V, V_K0, V_K1)  // Value gate (0.60-0.85)
Keff = K0 * Vgate  // Effective clarity accounts for value
```

**Rationale:** Low-value (dark) colors like earthy warm browns (#B37256, V=0.543) get lower Vgate → lower Keff → correctly classified as Autumn instead of Spring.

### 2. Updated Family Scoring

**Spring:**
```typescript
springKeffScore = ramp(Keff, springK0, springK1)  // 0.0-0.5
springScore = W * springKeffScore * peak(V, 0.62, 0.92)
```

**Autumn:**
```typescript
autumnInvKeffScore = ramp(1-Keff, autumnInvK0, autumnInvK1)  // 0.0-0.5
autumnScore = W * autumnInvKeffScore * peak(V, 0.35, 0.70)
```

**Changes:**
- Spring value window tightened: `0.55-0.85` → `0.62-0.92` (excludes mid/low value warm colors)
- Spring uses ramp on Keff instead of direct multiplication
- Autumn uses ramp on (1-Keff) for softness

### 3. Updated Subseason Scoring

All subseason scores now use `Keff` instead of `K0`:
- Spring subseasons: `peak(Keff, ...)` or `ramp(Keff, ...)`
- Autumn subseasons: `peak(Keff, ...)` or `invRamp(Keff, ...)`
- Summer/Winter subseasons: `invRamp(Keff, ...)` or `peak(Keff, ...)`

### 4. Configuration Updates

**New parameters added:**
- `V_K0: 0.60` - Lower value threshold for clarity gate
- `V_K1: 0.85` - Upper value threshold for clarity gate
- `springK0: 0.0` - Lower clarity threshold for Spring family
- `springK1: 0.5` - Upper clarity threshold for Spring family
- `autumnInvK0: 0.0` - Lower inverse clarity threshold for Autumn
- `autumnInvK1: 0.5` - Upper inverse clarity threshold for Autumn

**Updated parameters:**
- `springV: { lo: 0.62, hi: 0.92 }` - Tightened to exclude mid/low value

### 5. Debug Output Updates

**CSV columns updated:**
- Old: `hex,L,a,b,C,W,V,K,familyScores,...`
- New: `hex,L,a,b,C,W,V,K0,Vgate,Keff,familyScores,...`

**Debug object:**
```typescript
debug: {
  K0,      // Base clarity (from chroma)
  Vgate,   // Value gate
  Keff,    // Effective clarity
  K: Keff, // Legacy alias for backward compatibility
  ...
}
```

### 6. Parameter Sweep Expansion

**New dimensions:**
- `V_K0`: [0.55..0.65] step 0.05
- `V_K1`: [0.80..0.90] step 0.05
- `springVlo`: [0.58..0.70] step 0.04
- `springK0`: [0.0..0.2] step 0.05 (fine sweep)
- `springK1`: [0.4..0.6] step 0.05 (fine sweep)

**Sweep strategy:** Two-phase approach
1. Phase 1: Coarse sweep (wb, C_ref, V_K0, V_K1, springVlo)
2. Phase 2: Fine sweep around best (springK0, springK1)

## Results

### DEFAULT Config (with Keff)
- **Accuracy: 41.7% (10/24)**
- **#B37256**: autumn-true → autumn-soft ✓ (family correct!)

### BEST Config (after parameter sweep)
- **Best: wb=18, C_ref=60, V_K0=0.55, V_K1=0.8, springVlo=0.58**
- **Accuracy: 50.0% (12/24)**
- **#B37256**: autumn-true → autumn-soft ✓ (family correct, subseason close)

### Key Improvement: #B37256

**Before Keff:**
- V=0.543, C=34.5, K0=0.69
- High K → Spring family wins

**After Keff:**
- V=0.543, C=34.5, K0=0.69
- Vgate = ramp(0.543, 0.60, 0.85) ≈ 0.0 (below threshold)
- Keff = 0.69 * 0.0 ≈ 0.0
- Low Keff → Autumn family wins ✓

## Failure Analysis

### Category A (Wrong Family): 6 failures
- #FF0801: spring-bright → autumn-deep
- #E8D5C4: summer-light → spring-bright
- #B8A8A8: summer-true → autumn-soft
- #00A2FF: winter-bright → summer-soft
- #FF0041: winter-bright → autumn-soft
- #4A5C8C: winter-true → autumn-deep

**Note:** #B37256 is no longer in Category A! Keff fix worked.

### Category B (Correct Family, Wrong Subseason): 6 failures
- #FEA176: spring-light → spring-true
- #FFBE00: spring-true → spring-bright
- #8FA3B8: summer-true → summer-soft
- #B37256: autumn-true → autumn-soft (now Category B!)
- #8C5C42: autumn-deep → autumn-soft
- #5C2842: winter-true → winter-deep

## Next Steps

1. **Verify #B37256 improvement** in snapshots (check K0, Vgate, Keff values)
2. **Apply Category B config tuning** for remaining subseason misclassifications
3. **Address Category A failures** - may need further formula adjustments or parameter tuning

## Files Updated

- `src/lib/color-utils.ts` - Core classification logic with Keff
- `run-calibration-standalone.mjs` - Updated standalone runner
- `src/test/debug-table.ts` - Updated CSV columns
- `season-anchors-snapshot-default.csv` - New snapshot with Keff
- `season-anchors-snapshot-best.csv` - Best config snapshot with Keff
