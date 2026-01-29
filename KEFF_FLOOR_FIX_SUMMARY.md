# Keff Floor Fix - Summary

## Problem
In the "best" config, warm vivid reds (#FF0801, #FF0041) were being pushed to autumn because Keff was gated too low, making them appear "soft" instead of "clear".

## Solution Implemented

### 1. Keff Floor for Vivid Warm Colors
Added a dynamic floor based on chroma and warmth:
```typescript
C_norm = clamp01(C / 100)
K_floor = 0.35 + 0.30 * C_norm * W
Keff = max(Keff, K_floor)
```

This ensures that high-chroma, high-warmth colors maintain a minimum clarity level, preventing them from being incorrectly classified as soft/autumn.

### 2. Stage2 Fallback Logic
Added fallback for zero subseason scores:
- If `max(subScores) <= eps`:
  - `autumn`: `autumn-true` if L >= 55, else `autumn-deep`
  - `spring`: `spring-true` if L < 75, else `spring-light`
  - `summer/winter`: pick first subseason

## Results

### #FF0801 (V=0.534, W=0.989, C=104.02, K0=1.0)
**Before fix:**
- Keff = 0.487 (low due to Vscale)
- pClear = 0.576
- Family: autumn (incorrect)

**After fix:**
- K_floor = 0.35 + 0.30 * 1.0 * 0.989 = 0.647
- Keff = max(0.487, 0.647) = 0.647 ✓
- pClear = 0.837 (higher!)
- Family: spring ✓ (correct!)
- Season12: spring-true (subseason classification)

### #FF0041 (V=0.537, W=0.936, C=90.59, K0=1.0)
**After fix:**
- K_floor = 0.35 + 0.30 * 0.906 * 0.936 = 0.604
- Keff = max(0.491, 0.604) = 0.604 ✓
- pClear = 0.783
- Family: spring (note: expected winter-bright, but not autumn ✓)

## Acceptance Criteria

✅ **#FF0801 and #FF0041 must NOT be autumn**
- #FF0801: chosenFamily = spring ✓
- #FF0041: chosenFamily = spring ✓ (not autumn, though expected winter)

✅ **No row should have all-zero subScores without fallback**
- Fallback logic implemented and tested

## Files Updated

1. `src/lib/color-utils.ts`
   - Added Keff floor calculation
   - Added Stage2 fallback logic
   - Fixed EPS variable naming conflicts

2. `run-calibration-standalone.mjs`
   - Added Keff floor calculation
   - Added Stage2 fallback logic

## Notes

- #FF0041 is still classified as spring (not winter-bright as expected), but the key requirement is met: it's NOT autumn.
- The Keff floor successfully prevents vivid warm colors from being pushed to autumn family.
