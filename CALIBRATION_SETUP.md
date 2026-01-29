# Calibration & Regression Setup

## Overview

This document describes the calibration and regression testing infrastructure for the 2-stage color classification system.

## Files Created

### 1. `src/test/season-anchors.ts`
Contains 24 anchor colors (2 per subseason):
- Defines `SEASON_ANCHORS` array with `{ hex, expectedFamily, expectedSeason12, note }`
- Covers all 12 subseasons with representative colors

### 2. `src/test/season-anchors-test.ts`
Regression test that:
- Loops through all 24 anchors
- Asserts `predicted.family === expectedFamily`
- Asserts `predicted.season12 === expectedSeason12`
- Asserts `predicted.season12Prob >= 0.35` (minimum confidence threshold)

**Run with:** `npm test -- src/test/season-anchors-test.ts`

### 3. `src/test/debug-table.ts`
Debug table function (node-safe) that:
- Generates CSV output for each anchor
- Columns: `hex,L,a,b,C,W,V,K,familyScores,chosenFamily,subScores,season12,top3`
- `saveDebugTableSnapshot()` saves to `src/test/season-anchors-snapshot.csv`
- Can be diffed before/after tuning

**Usage:**
```typescript
import { generateDebugTable, saveDebugTableSnapshot } from './debug-table';

// Generate CSV string
const csv = generateDebugTable();

// Save to file
saveDebugTableSnapshot();
```

### 4. `src/test/parameter-sweep.ts`
Parameter sweep utility that:
- Tests grid of `wb` (10..20, step 2) and `C_ref` (40..70, step 5)
- Evaluates each combination on all 24 anchors
- Returns best configuration with highest accuracy
- Shows top 5 configurations and incorrect classifications

**Usage:**
```typescript
import { parameterSweep, evaluateConfig } from './parameter-sweep';

// Run sweep
const { bestConfig, bestAccuracy, results } = parameterSweep();

// Evaluate specific config
const { accuracy, details } = evaluateConfig(config);
```

## Configuration Object

All constants moved to `DEFAULT_CLASSIFICATION_CONFIG` in `src/lib/color-utils.ts`:

```typescript
export interface ClassificationConfig {
  wb: number;              // Warmth bandwidth (default: 15)
  C_ref: number;           // Clarity reference (default: 50)
  C_bright0: number;       // Bright chroma lower (default: 45)
  C_bright1: number;       // Bright chroma upper (default: 60)
  
  // Stage 1 family value ranges
  springV: { lo: number; hi: number };
  autumnV: { lo: number; hi: number };
  summerV: { lo: number; hi: number };
  winterV: { lo: number; hi: number };
  
  // Stage 2 subseason thresholds (all families)
  // ... (see code for full list)
}
```

## No Magic Numbers

All hardcoded values have been moved to the config object:
- ✅ `wb = 15` → `config.wb`
- ✅ `C_ref = 50` → `config.C_ref`
- ✅ `C_bright0 = 45, C_bright1 = 60` → `config.C_bright0/1`
- ✅ All value/clarity thresholds → config object
- ✅ Peak edge width `0.1` → `PEAK_EDGE_WIDTH` constant

## Calibration Workflow

1. **Baseline**: Run `season-anchors-test.ts` to see current accuracy
2. **Generate snapshot**: Run `debug-table.ts` to create baseline CSV
3. **Parameter sweep**: Run `parameter-sweep.ts` to find optimal `wb` and `C_ref`
4. **Update config**: Modify `DEFAULT_CLASSIFICATION_CONFIG` with best values
5. **Verify**: Re-run tests and generate new snapshot to compare

## Example Output

### Debug Table CSV Format
```csv
hex,L,a,b,C,W,V,K,familyScores,chosenFamily,subScores,season12,top3
#FEA176,75.2,22.1,35.4,41.6,0.906,0.752,0.832,spring:0.823,autumn:0.142,summer:0.021,winter:0.014,spring,spring-light:0.456,spring-true:0.312,spring-bright:0.232,spring-light,spring-light:45.6%;spring-true:31.2%;spring-bright:23.2%
```

### Parameter Sweep Output
```
Running parameter sweep: wb [10..20] step 2, C_ref [40..70] step 5
Total combinations: 33

Best configuration: wb=15, C_ref=50
Best accuracy: 87.5%

Top 5 configurations:
  1. wb=15, C_ref=50: 87.5%
  2. wb=14, C_ref=50: 83.3%
  3. wb=16, C_ref=50: 83.3%
  ...
```

## Next Steps

1. Run initial regression test to establish baseline
2. Generate initial snapshot CSV
3. Run parameter sweep to find optimal constants
4. Update config with best values
5. Re-run tests and compare snapshots
6. Iterate on threshold tuning if needed (manual adjustment of config values)

## Notes

- The parameter sweep only tunes `wb` and `C_ref` as requested
- Other thresholds can be manually adjusted in the config object
- The debug table can be diffed to see exactly what changed between runs
- All tests use the same 24 anchor colors for consistency
