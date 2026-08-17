# Keff (Effective Clarity) Fix - Results Summary

## ✅ Success: #B37256 Now Correctly Classified as Autumn Family

### Before Keff Fix:
- **#B37256**: autumn-true → **spring-true** ✗ (wrong family)
- K0 = 0.691 (high chroma → "clear")
- Spring family won due to high clarity

### After Keff Fix:
- **#B37256**: autumn-true → **autumn-soft** ✓ (correct family!)
- V = 0.543 (low value/dark)
- K0 = 0.691 (base clarity from chroma)
- **Vgate = 0.000** (V=0.543 < V_K0=0.60, so ramp returns 0)
- **Keff = 0.000** (K0 * Vgate = 0.691 * 0.000)
- Spring score = 0.000 (low Keff → no Spring)
- Autumn score = 0.851 (high 1-Keff → Autumn wins) ✓

**Result:** Family classification fixed! Now correctly identifies as Autumn.

## Test Results

### DEFAULT Config (with Keff)
- **Accuracy: 41.7% (10/24)**
- **Improvement:** #B37256 family fixed (was wrong family, now correct family)

### BEST Config (after parameter sweep)
- **Best params:** wb=18, C_ref=60, V_K0=0.55, V_K1=0.8, springVlo=0.58
- **Accuracy: 50.0% (12/24)**
- **Improvement:** +8.3% from DEFAULT

## CSV Snapshot Analysis

### #B37256 Comparison

**DEFAULT config:**
```
hex: #B37256
L: 54.3, a: 22.6, b: 26.1
C: 34.55, W: 0.851, V: 0.543
K0: 0.691, Vgate: 0.000, Keff: 0.000
familyScores: spring:0.000, autumn:0.851, summer:0.139, winter:0.000
chosenFamily: autumn ✓
season12: autumn-soft (expected: autumn-true)
```

**BEST config:**
```
hex: #B37256
L: 54.3, a: 22.6, b: 26.1
C: 34.55, W: 0.810, V: 0.543
K0: 0.576, Vgate: 0.000, Keff: 0.000
familyScores: spring:0.000, autumn:0.810, summer:0.177, winter:0.000
chosenFamily: autumn ✓
season12: autumn-soft (expected: autumn-true)
```

**Key observation:** Vgate = 0.000 correctly gates low-value colors, preventing Spring misclassification.

## Remaining Failures

### Category A (Wrong Family): 6 failures
1. #FF0801: spring-bright → autumn-deep
2. #E8D5C4: summer-light → spring-bright
3. #B8A8A8: summer-true → autumn-soft
4. #00A2FF: winter-bright → summer-soft
5. #FF0041: winter-bright → autumn-soft
6. #4A5C8C: winter-true → autumn-deep

**Note:** #B37256 is NO LONGER in Category A! ✓

### Category B (Correct Family, Wrong Subseason): 6 failures
1. #FEA176: spring-light → spring-true
2. #FFBE00: spring-true → spring-bright
3. #8FA3B8: summer-true → summer-soft
4. **#B37256: autumn-true → autumn-soft** (moved from Category A!)
5. #8C5C42: autumn-deep → autumn-soft
6. #5C2842: winter-true → winter-deep

## Diff Summary (DEFAULT → BEST)

### Key Changes in W, K, familyScores, season12

**#B37256:**
- W: 0.851 → 0.810 (slightly lower warmth)
- K0: 0.691 → 0.576 (lower base clarity with higher C_ref)
- Vgate: 0.000 → 0.000 (unchanged, still below threshold)
- Keff: 0.000 → 0.000 (unchanged)
- Family: autumn → autumn ✓ (unchanged, correct)
- Season12: autumn-soft → autumn-soft (unchanged, still wrong subseason)

**Other notable changes:**
- Spring colors with high V get higher Vgate → higher Keff → remain Spring ✓
- Low-value warm colors get low Vgate → low Keff → correctly go to Autumn ✓

## Implementation Details

### Formula Changes

**Family scoring:**
```typescript
// Spring
springKeffScore = ramp(Keff, springK0, springK1)  // 0.0-0.5
springScore = W * springKeffScore * peak(V, 0.62, 0.92)

// Autumn  
autumnInvKeffScore = ramp(1-Keff, autumnInvK0, autumnInvK1)  // 0.0-0.5
autumnScore = W * autumnInvKeffScore * peak(V, 0.35, 0.70)
```

**Subseason scoring:** All use `Keff` instead of `K0`

### Configuration Parameters

```typescript
V_K0: 0.60        // Lower value threshold
V_K1: 0.85        // Upper value threshold
springK0: 0.0     // Lower clarity for Spring
springK1: 0.5      // Upper clarity for Spring
autumnInvK0: 0.0   // Lower inverse clarity for Autumn
autumnInvK1: 0.5   // Upper inverse clarity for Autumn
springV: { lo: 0.62, hi: 0.92 }  // Tightened value range
```

## Next Steps

1. ✅ **Keff fix verified** - #B37256 family classification fixed
2. **Category B tuning** - Adjust subseason thresholds for #B37256 (autumn-true vs autumn-soft)
3. **Category A analysis** - Investigate remaining 6 wrong-family failures
4. **Parameter refinement** - Fine-tune V_K0, V_K1, springK thresholds based on full sweep results

## Files Generated

- `season-anchors-snapshot-default.csv` - DEFAULT config with Keff columns
- `season-anchors-snapshot-best.csv` - BEST config with Keff columns
- Both include: `K0,Vgate,Keff` columns for analysis
