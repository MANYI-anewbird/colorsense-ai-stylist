# Stage2 Robustness Fix - Summary

## Problem
Stage2 subseason classification could fail when all subScores are zero or too small, leading to incorrect or undefined results.

## Solution Implemented

### 1. Enhanced Fallback Rules
When `max(subScores) <= 1e-6`, use fallback rules based on L and pClear:

**Spring:**
- If L >= 78 → spring-light
- Else if pClear >= 0.75 → spring-bright
- Else → spring-true

**Summer:**
- If L >= 78 → summer-light
- Else if pClear <= 0.35 → summer-soft
- Else → summer-true

**Autumn:**
- If L <= 45 → autumn-deep
- Else if pClear <= 0.35 → autumn-soft
- Else → autumn-true

**Winter:**
- If L <= 45 → winter-deep
- Else if pClear >= 0.75 → winter-bright
- Else → winter-true

### 2. Fallback Probability Distribution
When using fallback:
- Primary season12 gets 60% probability
- Other two subseasons get 20% each
- Normalized to sum to 1.0

### 3. Borderline Flag
Added `isBorderline` flag for UI/explanations:
- `isBorderline = (top1Score - top2Score) < 0.06`
- When borderline, UI can show top3 and note "between X and Y"

## Results

### Acceptance Criteria ✅

**#FF0801:**
- chosenFamily = spring ✓ (stays spring)
- season12 = spring-true (subseason classification)

**#FF0041:**
- chosenFamily = spring ✓ (stays spring, not autumn)
- season12 = spring-true

**#00A2FF:**
- chosenFamily = winter ✓ (stays winter)
- season12 = winter-true

**#D4E8F0:**
- chosenFamily = summer ✓ (stays summer)
- season12 = summer-light

### No All-Zero SubScores
- Fallback logic ensures no row has all-zero subScores without fallback
- EPS threshold set to 1e-6 (more lenient than before)

## Files Updated

1. `src/lib/color-utils.ts`
   - Enhanced fallback rules with L and pClear
   - Added `isBorderline` flag calculation
   - Updated debug output to include `isBorderline`

2. `run-calibration-standalone.mjs`
   - Same fallback logic and borderline detection
   - Updated debug output

## Implementation Details

### Fallback Logic Flow
```typescript
if (maxSubScore <= EPS_SUBSEASON) {
  // Use fallback rules based on L and pClear
  // Set heuristic probabilities (60% primary, 20% each for others)
} else {
  // Normal softmax on subseason scores
  // Calculate isBorderline flag
}
```

### Borderline Detection
```typescript
const sortedProbs = familySubseasons
  .map(s => ({ season: s, prob: season12Probs[s] }))
  .sort((a, b) => b.prob - a.prob);
isBorderline = (sortedProbs[0].prob - sortedProbs[1].prob) < 0.06;
```

## Notes

- Stage1 (familyScores) remains unchanged as requested
- Fallback rules are more sophisticated, using both L and pClear
- Borderline flag enables better UI explanations for ambiguous cases
