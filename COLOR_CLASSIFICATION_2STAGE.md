# 2-Stage Color Classification System

## Overview

This document describes the new 2-stage color classification system that replaces the old penalty-based approach. The system uses only continuous scores (0..1) with no boolean gates, making it more principled and maintainable.

## Architecture

### Stage 1: 4-Season Family Classification
Classifies colors into one of four families: **spring**, **summer**, **autumn**, **winter**.

### Stage 2: 12-Season Subseason Classification
Within the chosen family, classifies into one of three subseasons (12 seasons total).

## Helper Functions

All helper functions operate on continuous values in [0, 1]:

- **`clamp01(x)`**: Clamps value to [0, 1]
- **`ramp(x, x0, x1)`**: Linear ramp from 0 at x0 to 1 at x1
- **`invRamp(x, x0, x1)`**: Inverse ramp (1 at x0, 0 at x1)
- **`peak(x, lo, hi)`**: 1 in [lo, hi], smooth edges outside

## LAB-Derived Features

The system uses the following features computed from LAB color space:

- **L**: Lightness (0-100)
- **a**: Green-red axis (-128 to 127)
- **b**: Blue-yellow axis (-128 to 127)
- **C** (Chroma): `sqrt(a² + b²)` - saturation measure
- **W** (Warmth): `sigmoid(b / wb)` - warm/cool measure
  - `wb = 15`: Controls transition sharpness
  - b* > 15 is warm, b* < -15 is cool, smooth transition in between
- **V** (Value): `L / 100` - normalized lightness
- **K** (Clarity): `clamp01(C / C_ref)` - normalized chroma
  - `C_ref = 50`: Reference chroma for full clarity

## Stage 1: Family Scores

Family scores are computed using W, V, and K:

```
spring = W * K * peak(V, 0.55, 0.85)
autumn = W * (1-K) * peak(V, 0.35, 0.70)
summer = (1-W) * (1-K) * peak(V, 0.55, 0.90)
winter = (1-W) * K * peak(V, 0.30, 0.70)
```

**Rationale:**
- **Spring**: Warm + Clear + Medium-Light (V 0.55-0.85)
- **Autumn**: Warm + Soft + Medium (V 0.35-0.70)
- **Summer**: Cool + Soft + Light (V 0.55-0.90)
- **Winter**: Cool + Clear + Medium-Dark (V 0.30-0.70)

Scores are normalized using softmax to get family probabilities.

## Stage 2: Subseason Scores

### Spring Subseasons

```
light  = ramp(V, 0.70, 0.90) * ramp(W, 0.55, 0.75) * peak(K, 0.35, 0.85)
true   = peak(W, 0.65, 0.95) * peak(V, 0.50, 0.80) * peak(K, 0.30, 0.75)
bright = ramp(C, 45, 60) * ramp(K, 0.65, 0.90) * peak(V, 0.45, 0.80)
```

**Constants:**
- `C_bright0 = 45`, `C_bright1 = 60`: Chroma thresholds for Bright Spring

### Autumn Subseasons

```
soft = invRamp(K, 0.45, 0.70) * peak(V, 0.45, 0.75) * peak(W, 0.55, 0.85)
true = peak(W, 0.65, 0.95) * peak(V, 0.40, 0.70) * peak(K, 0.25, 0.60)
deep = invRamp(V, 0.35, 0.55) * peak(W, 0.60, 0.95) * peak(K, 0.25, 0.65)
```

### Summer Subseasons

```
light = ramp(V, 0.70, 0.92) * invRamp(W, 0.35, 0.55) * invRamp(K, 0.45, 0.70)
true  = invRamp(W, 0.20, 0.45) * peak(V, 0.55, 0.85) * invRamp(K, 0.40, 0.70)
soft  = invRamp(K, 0.35, 0.60) * peak(V, 0.45, 0.80) * invRamp(W, 0.25, 0.55)
```

### Winter Subseasons

```
bright = ramp(C, 45, 60) * ramp(K, 0.65, 0.90) * invRamp(W, 0.35, 0.55)
true   = invRamp(W, 0.10, 0.40) * peak(V, 0.35, 0.70) * peak(K, 0.45, 0.85)
deep   = invRamp(V, 0.30, 0.50) * invRamp(W, 0.10, 0.40) * peak(K, 0.45, 0.85)
```

**Constants:**
- `C_bright0 = 45`, `C_bright1 = 60`: Chroma thresholds for Bright Winter

Subseason scores are normalized using softmax within the chosen family.

## Key Constants Explained

### Warmth Bandwidth (wb = 15)
Controls the sharpness of the warm/cool transition. With wb=15:
- b* > 15: Strongly warm (W ≈ 1)
- b* < -15: Strongly cool (W ≈ 0)
- -15 < b* < 15: Smooth transition

### Clarity Reference (C_ref = 50)
Reference chroma for full clarity. Colors with C ≥ 50 have K = 1 (maximum clarity).

### Bright Chroma Thresholds (C_bright0 = 45, C_bright1 = 60)
For Bright Spring and Bright Winter, colors with chroma in this range get higher scores. Very high chroma (C ≥ 60) ensures maximum score.

## Regression Tests

The following anchor colors are tested:

1. **#FF0801**: Should be Bright Spring (family spring)
2. **#FFBE00**: Should be Spring family (Bright or True Spring, bias to Bright if C very high)
3. **#FEA176**: Should be Spring family (Light or True Spring)
4. **#B37256**: Should be True Autumn (family autumn)

## Debug Mode

Set `window.DEBUG_COLOR_CLASSIFICATION = true` in browser console to see detailed logging:
- Features: L, a, b, C, W, V, K
- Family scores and probabilities
- Chosen family
- Subseason scores and probabilities (within family)
- Final top3 results

## Backward Compatibility

The new `classifyColorLAB()` function is wrapped by the existing `calculateSeasonMatchBreakdown()` function, maintaining full backward compatibility with existing UI components.

## Benefits

1. **No Boolean Gates**: All logic uses continuous scores, making the system more predictable
2. **Principled Approach**: Based on color theory (warmth, value, clarity) rather than ad-hoc penalties
3. **Maintainable**: Clear separation between family and subseason classification
4. **Debuggable**: Comprehensive debug logging and transparent score calculations
5. **Testable**: Regression tests ensure anchor colors are classified correctly
