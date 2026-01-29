# Calibration Results Summary

## 1. Season Anchors Test Results

### DEFAULT Config (wb=15, C_ref=50)
- **Accuracy: 45.8% (11/24 correct)**
- **Failures: 13**

#### Failing Anchors:

| hex | expected | got | family | confidence | top3 |
|-----|----------|-----|--------|------------|------|
| #FEA176 | spring-light | spring-bright | ✓ | 16.3% | spring-bright:16.3%;spring-light:13.8%;spring-true:13.8% |
| #FFBE00 | spring-true | spring-bright | ✓ | 26.4% | spring-bright:26.4%;spring-light:10.5%;spring-true:10.5% |
| #FF8C42 | spring-true | spring-bright | ✓ | 27.0% | spring-bright:27.0%;spring-light:9.9%;spring-true:9.9% |
| #E8D5C4 | summer-light | summer-soft | ✓ | 9.7% | summer-light:9.7%;summer-true:9.7%;summer-soft:9.7% |
| #8FA3B8 | summer-true | summer-soft | ✓ | 14.5% | summer-soft:14.5%;summer-true:11.5%;summer-light:6.2% |
| #B8A8A8 | summer-true | autumn-soft | ✗ | 16.4% | autumn-soft:16.4%;autumn-true:7.0%;autumn-deep:7.0% |
| #B8A088 | autumn-soft | autumn-true | ✓ | 13.3% | autumn-soft:13.3%;autumn-true:13.3%;autumn-deep:4.9% |
| #A88C70 | autumn-soft | autumn-true | ✓ | 13.0% | autumn-soft:13.0%;autumn-true:13.0%;autumn-deep:4.8% |
| #B37256 | autumn-true | spring-true | ✗ | 19.2% | spring-true:19.2%;spring-light:7.1%;spring-bright:7.1% |
| #D4A070 | autumn-true | spring-true | ✗ | 20.4% | spring-true:20.4%;spring-light:7.5%;spring-bright:7.5% |
| #8C5C42 | autumn-deep | autumn-true | ✓ | 14.1% | autumn-true:14.1%;autumn-deep:9.1%;autumn-soft:8.2% |
| #FF0041 | winter-bright | spring-bright | ✗ | 24.4% | spring-bright:24.4%;spring-light:9.0%;spring-true:9.0% |
| #5C2842 | winter-true | winter-deep | ✓ | 9.2% | winter-bright:9.2%;winter-true:9.2%;winter-deep:9.2% |

## 2. Parameter Sweep Results

### Best Configuration
- **wb = 14** (was 15)
- **C_ref = 40** (was 50)
- **Accuracy: 50.0% (12/24 correct)**
- **Improvement: +4.2% (+1 anchor)**

### Top 5 Configurations
1. wb=14, C_ref=40: **50.0%**
2. wb=14, C_ref=55: **50.0%**
3. wb=14, C_ref=70: **50.0%**
4. wb=16, C_ref=40: **50.0%**
5. wb=16, C_ref=55: **50.0%**

**Observation**: Multiple configurations achieve 50% accuracy. The best uses lower C_ref (40 vs 50), suggesting clarity threshold should be lower.

## 3. BEST Config Results

### After Parameter Sweep (wb=14, C_ref=40)
- **Accuracy: 50.0% (12/24 correct)**
- **Remaining Failures: 12**

#### Remaining Failures:

| hex | expected | got | family | confidence | top3 |
|-----|----------|-----|--------|------------|------|
| #FEA176 | spring-light | spring-bright | ✓ | 16.9% | spring-bright:16.9%;spring-light:14.3%;spring-true:14.3% |
| #FFBE00 | spring-true | spring-bright | ✓ | 26.4% | spring-bright:26.4%;spring-light:10.5%;spring-true:10.5% |
| #FF8C42 | spring-true | spring-bright | ✓ | 27.1% | spring-bright:27.1%;spring-light:10.0%;spring-true:10.0% |
| #E8D5C4 | summer-light | summer-soft | ✓ | 9.4% | summer-light:9.4%;summer-true:9.4%;summer-soft:9.4% |
| #8FA3B8 | summer-true | summer-soft | ✓ | 14.1% | summer-soft:14.1%;summer-true:11.3%;summer-light:5.7% |
| #B8A8A8 | summer-true | autumn-soft | ✗ | 16.4% | autumn-soft:16.4%;autumn-true:6.8%;autumn-deep:6.8% |
| #B8A088 | autumn-soft | autumn-true | ✓ | 12.7% | autumn-soft:12.7%;autumn-true:12.7%;autumn-deep:4.7% |
| #A88C70 | autumn-soft | autumn-true | ✓ | 13.1% | autumn-true:13.1%;autumn-soft:10.8%;autumn-deep:4.8% |
| #B37256 | autumn-true | spring-bright | ✗ | 12.7% | spring-light:12.7%;spring-true:12.7%;spring-bright:12.7% |
| #D4A070 | autumn-true | spring-bright | ✗ | 13.6% | spring-light:13.6%;spring-true:13.6%;spring-bright:13.6% |
| #FF0041 | winter-bright | spring-bright | ✗ | 24.5% | spring-bright:24.5%;spring-light:9.0%;spring-true:9.0% |
| #5C2842 | winter-true | winter-deep | ✓ | 9.5% | winter-bright:9.5%;winter-true:9.5%;winter-deep:9.5% |

## 4. Failure Categorization

### Category A: Wrong Family (4 failures)
These require formula changes or broader parameter tuning (wb/C_ref/C_bright0/1):

1. **#B8A8A8**: summer-true → autumn-soft
   - Issue: Cool muted rose classified as warm autumn
   - Analysis: Likely warmth (W) calculation issue for near-neutral colors

2. **#B37256**: autumn-true → spring-bright  
   - Issue: Warm earthy brown classified as bright spring
   - Analysis: Family classification fails - spring score too high for earthy colors

3. **#D4A070**: autumn-true → spring-bright
   - Issue: Warm caramel classified as bright spring
   - Analysis: Similar to #B37256 - family boundary issue

4. **#FF0041**: winter-bright → spring-bright
   - Issue: Cool fuchsia classified as warm spring
   - Analysis: Very high chroma cool color misclassified - warmth calculation issue

### Category B: Correct Family, Wrong Subseason (8 failures)
These can be fixed with config threshold tuning:

1. **#FEA176**: spring-light → spring-bright
   - Issue: Light Spring classified as Bright Spring
   - Fix: Increase `springBrightK.lo` from 0.65 to 0.75, or adjust `springLightV` range

2. **#FFBE00**: spring-true → spring-bright
   - Issue: True Spring classified as Bright Spring  
   - Fix: Increase `springBrightK.lo` from 0.65 to 0.70, or increase `C_bright0` from 45 to 50

3. **#FF8C42**: spring-true → spring-bright
   - Issue: True Spring classified as Bright Spring
   - Fix: Same as #FFBE00

4. **#E8D5C4**: summer-light → summer-soft
   - Issue: Light Summer classified as Soft Summer
   - Fix: Adjust `summerLightV` or `summerLightK` thresholds

5. **#8FA3B8**: summer-true → summer-soft
   - Issue: True Summer classified as Soft Summer
   - Fix: Adjust `summerTrueK` or `summerSoftK` thresholds

6. **#B8A088**: autumn-soft → autumn-true
   - Issue: Soft Autumn classified as True Autumn
   - Fix: Increase `autumnTrueK.lo` from 0.25 to 0.30, or adjust `autumnSoftK`

7. **#A88C70**: autumn-soft → autumn-true
   - Issue: Soft Autumn classified as True Autumn
   - Fix: Same as #B8A088

8. **#5C2842**: winter-true → winter-deep
   - Issue: True Winter classified as Deep Winter
   - Fix: Adjust `winterTrueV` or `winterDeepV` thresholds

## 5. Proposed Config Tuning (Category B Only)

### Spring Subseason Fixes

```typescript
// Fix: #FEA176, #FFBE00, #FF8C42 (spring-true/light → spring-bright)
// Issue: Bright Spring threshold too low
springBrightK: { lo: 0.70, hi: 0.90 }, // was 0.65-0.90
C_bright0: 50, // was 45 (increase lower threshold for bright detection)
```

### Summer Subseason Fixes

```typescript
// Fix: #E8D5C4 (summer-light → summer-soft)
// Issue: Light Summer threshold too restrictive
summerLightV: { lo: 0.65, hi: 0.92 }, // was 0.70-0.92 (lower lo)
summerLightK: { lo: 0.40, hi: 0.70 }, // was 0.45-0.70 (lower lo)

// Fix: #8FA3B8 (summer-true → summer-soft)
// Issue: True Summer vs Soft Summer boundary
summerTrueK: { lo: 0.35, hi: 0.70 }, // was 0.40-0.70 (lower lo)
summerSoftK: { lo: 0.40, hi: 0.60 }, // was 0.35-0.60 (raise lo)
```

### Autumn Subseason Fixes

```typescript
// Fix: #B8A088, #A88C70 (autumn-soft → autumn-true)
// Issue: True Autumn threshold too low
autumnTrueK: { lo: 0.30, hi: 0.60 }, // was 0.25-0.60 (raise lo)
autumnSoftK: { lo: 0.50, hi: 0.70 }, // was 0.45-0.70 (raise lo to favor soft)
```

### Winter Subseason Fixes

```typescript
// Fix: #5C2842 (winter-true → winter-deep)
// Issue: Deep Winter threshold too low
winterDeepV: { lo: 0.25, hi: 0.50 }, // was 0.30-0.50 (lower lo)
winterTrueV: { lo: 0.40, hi: 0.70 }, // was 0.35-0.70 (raise lo)
```

## 6. CSV Snapshots Generated

- `season-anchors-snapshot-default.csv` - DEFAULT config results
- `season-anchors-snapshot-best.csv` - BEST config (wb=14, C_ref=40) results

Use `diff` to compare W, K, familyScores, and season12 changes.

## 7. Next Steps

1. **Apply Category B fixes** - Update config thresholds as proposed above
2. **Re-run tests** - Verify improvements
3. **Address Category A** - If Category A failures persist after config tuning, consider:
   - Adjusting wb/C_ref further (try wb=12-16, C_ref=35-45)
   - Modifying family score formulas (especially for high-chroma colors)
   - Adding additional features (e.g., hue angle) for family classification

## 8. Key Observations

1. **Parameter sweep shows**: Lower C_ref (40 vs 50) improves accuracy
2. **Spring Bright over-classification**: 3 Spring colors misclassified as Bright - threshold too low
3. **Autumn/Spring boundary issue**: 2 Autumn colors classified as Spring - family formula needs work
4. **Low confidence scores**: Many failures have confidence < 20%, suggesting ambiguous classifications
