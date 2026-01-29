# Calibration Results & Analysis

## Instructions to Run

Due to network limitations, please run the following commands when network is available:

```bash
# 1. Run season anchors test
npm test -- src/test/season-anchors-test.ts

# 2. Run parameter sweep (requires Node.js with TypeScript support)
# Option A: Use tsx
npx tsx src/test/parameter-sweep.ts

# Option B: Use the calibration runner
npx tsx src/test/run-calibration.ts

# 3. Generate debug tables
# In browser console or Node.js:
import { generateDebugTable, saveDebugTableSnapshot } from './src/test/debug-table';
saveDebugTableSnapshot(); // Saves default config snapshot
```

## Expected Output Format

### 1. Season Anchors Test Results

```
=== Failing Anchors (DEFAULT config) ===

hex: #XXXXXX
expected: spring-true
got: autumn-true
top3: spring-true:45.2%;autumn-true:38.7%;spring-bright:16.1%
confidence: 38.7%
familyCorrect: false

[Repeat for each failure...]
```

### 2. Parameter Sweep Results

```
=== Parameter Sweep Results ===

Best config: wb=15, C_ref=50
Best accuracy: 87.5% (21/24)

Top 5 configurations:
  1. wb=15, C_ref=50: 87.5%
  2. wb=14, C_ref=50: 83.3%
  3. wb=16, C_ref=50: 83.3%
  4. wb=15, C_ref=45: 79.2%
  5. wb=15, C_ref=55: 79.2%
```

### 3. Debug Table CSV Format

```csv
hex,L,a,b,C,W,V,K,familyScores,chosenFamily,subScores,season12,top3
#FEA176,75.2,22.1,35.4,41.6,0.906,0.752,0.832,spring:0.823,autumn:0.142,summer:0.021,winter:0.014,spring,spring-light:0.456,spring-true:0.312,spring-bright:0.232,spring-light,spring-light:45.6%;spring-true:31.2%;spring-bright:23.2%
```

### 4. Failure Categorization

**Category A: Wrong Family**
- These require formula changes or broader parameter tuning
- Example: Spring color classified as Autumn

**Category B: Correct Family, Wrong Subseason**
- These can be fixed with config threshold tuning
- Example: True Spring classified as Bright Spring

## Analysis Template

Once you have the results, fill in:

### Default Config Failures
- Total: X/24
- Wrong family: X
- Wrong subseason: X

### Best Config (after sweep)
- Total: X/24  
- Wrong family: X
- Wrong subseason: X

### Key Changes (DEFAULT → BEST)
- W values: [summary of changes]
- K values: [summary of changes]
- Family scores: [which families improved]
- Season12 changes: [which anchors fixed]

### Proposed Config Tuning (Category B only)

For each wrong-subseason failure, propose threshold adjustments:

```
#B37256: autumn-true → autumn-soft
Issue: Too soft (K too low)
Fix: Increase autumnTrueK.lo from 0.25 to 0.30
```

## Next Steps

1. Run the tests when network is available
2. Fill in the results above
3. Apply proposed config tuning for Category B failures
4. Re-run tests to verify improvements
5. If Category A failures persist, consider formula adjustments
