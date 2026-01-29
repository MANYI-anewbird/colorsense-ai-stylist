# Calibration Execution Instructions

## Current Limitation
Due to network connectivity issues, automated test execution is not possible. Please follow these instructions to run the calibration when network is available.

## Step 1: Run Season Anchors Test

```bash
npm test -- src/test/season-anchors-test.ts --reporter=verbose
```

**Expected Output Format:**
```
FAIL  src/test/season-anchors-test.ts
  Season Anchors Regression Test
    ✗ #B37256 should be autumn-true (Warm earthy brown - True Autumn)
      Expected: "autumn-true"
      Received: "spring-true"
      
    [List all failures...]
```

**Extract failures and format as:**
```
hex: #B37256
expected: autumn-true
got: spring-true
top3: spring-true:45.2%;autumn-true:38.7%;spring-bright:16.1%
confidence: 45.2%
familyCorrect: false
```

## Step 2: Run Parameter Sweep

**Option A: Using tsx (recommended)**
```bash
npx tsx src/test/parameter-sweep.ts
```

**Option B: Using the calibration runner**
```bash
npx tsx src/test/run-calibration.ts
```

**Expected Output:**
```
Running parameter sweep: wb [10..20] step 2, C_ref [40..70] step 5
Total combinations: 33

Best configuration: wb=15, C_ref=50
Best accuracy: 87.5%

Top 5 configurations:
  1. wb=15, C_ref=50: 87.5%
  2. wb=14, C_ref=50: 83.3%
  3. wb=16, C_ref=50: 83.3%
  4. wb=15, C_ref=45: 79.2%
  5. wb=15, C_ref=55: 79.2%
```

## Step 3: Generate Debug Tables

Create a simple script or use the browser console:

```typescript
// In browser console or Node.js with imports
import { generateDebugTable } from './src/test/debug-table';
import { DEFAULT_CLASSIFICATION_CONFIG } from './src/lib/color-utils';
import { parameterSweep } from './src/test/parameter-sweep';

// Generate DEFAULT config table
const defaultTable = generateDebugTable(DEFAULT_CLASSIFICATION_CONFIG);

// Get best config from sweep
const { bestConfig } = parameterSweep();

// Generate BEST config table
const bestTable = generateDebugTable(bestConfig);

// Save to files
const fs = require('fs');
fs.writeFileSync('season-anchors-snapshot-default.csv', defaultTable);
fs.writeFileSync('season-anchors-snapshot-best.csv', bestTable);
```

## Step 4: Compare Snapshots

Use diff tool to compare the two CSV files:

```bash
diff season-anchors-snapshot-default.csv season-anchors-snapshot-best.csv
```

**Focus on these columns:**
- W (warmth) - should show changes
- K (clarity) - should show changes  
- familyScores - should show which families improved
- chosenFamily - should show family corrections
- season12 - should show subseason corrections

## Step 5: Categorize Failures

After running with BEST config, categorize remaining failures:

**Category A: Wrong Family**
- These indicate fundamental formula issues
- Require formula changes or broader parameter tuning (wb, C_ref, C_bright0/1)

**Category B: Correct Family, Wrong Subseason**
- These can be fixed with threshold tuning
- Propose specific config adjustments

**Example:**
```
Category A (Wrong Family):
  #B37256: autumn-true → spring-true
  Issue: Family classification incorrect
  Fix: Adjust wb or C_ref, or modify family score formulas

Category B (Wrong Subseason):
  #FFBE00: spring-true → spring-bright  
  Issue: Bright Spring threshold too low
  Fix: Increase springBrightK.lo from 0.65 to 0.70
```

## Step 6: Propose Fixes

**For Category B only**, propose config tuning:

```typescript
// Example fixes
const TUNED_CONFIG = {
  ...DEFAULT_CLASSIFICATION_CONFIG,
  // Fix #FFBE00: spring-true → spring-bright
  springBrightK: { lo: 0.70, hi: 0.90 }, // was 0.65-0.90
  
  // Fix #B37256: autumn-true → autumn-soft (if family correct)
  autumnTrueK: { lo: 0.30, hi: 0.60 }, // was 0.25-0.60
};
```

**For Category A**, only propose formula changes if parameter sweep doesn't help.

## Alternative: Browser Console Method

If Node.js execution is not possible, use the browser console:

1. Open the app in browser
2. Open developer console
3. The classification functions should be available
4. Manually test each anchor:

```javascript
// Convert hex to RGB
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return {r, g, b};
}

// Test an anchor
const rgb = hexToRgb('#B37256');
// Use your app's color analysis function
// Adjust based on your actual API
```

## Results Template

Once you have results, fill in:

### 1. DEFAULT Config Failures
```
Total: X/24 correct
Failures:
  [List each with hex, expected, got, top3, confidence, familyCorrect]
```

### 2. Parameter Sweep Results
```
Best: wb=X, C_ref=Y, accuracy=Z%
Top 5: [list]
```

### 3. BEST Config Failures  
```
Total: X/24 correct
Remaining failures: [list]
```

### 4. Diff Summary
```
Key changes in W: [summary]
Key changes in K: [summary]  
Family score improvements: [which families]
Season12 corrections: [which anchors fixed]
```

### 5. Proposed Fixes
```
Category A: [list with proposed formula changes]
Category B: [list with proposed config tuning]
```
