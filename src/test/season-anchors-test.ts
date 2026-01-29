import { describe, it, expect } from "vitest";
import { classifyColorLAB, rgbToLab } from "@/lib/color-utils";
import { SEASON_ANCHORS, type SeasonAnchor } from "./season-anchors";

/**
 * Helper to convert hex to LAB
 */
function hexToLab(hex: string): { L: number; a: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lab = rgbToLab(r, g, b);
  return { L: lab.l, a: lab.a, b: lab.b };
}

describe("Season Anchors Regression Test", () => {
  const MIN_CONFIDENCE_THRESHOLD = 0.35; // Minimum probability for a valid match
  
  for (const anchor of SEASON_ANCHORS) {
    it(`${anchor.hex} should be ${anchor.expectedSeason12} (${anchor.note})`, () => {
      const lab = hexToLab(anchor.hex);
      const result = classifyColorLAB(lab);
      
      // Assert family matches
      expect(result.family).toBe(anchor.expectedFamily);
      
      // Assert season12 matches
      expect(result.season12).toBe(anchor.expectedSeason12);
      
      // Assert confidence is above threshold
      const confidence = result.season12Probs[anchor.expectedSeason12];
      expect(confidence).toBeGreaterThanOrEqual(MIN_CONFIDENCE_THRESHOLD);
    });
  }
});
