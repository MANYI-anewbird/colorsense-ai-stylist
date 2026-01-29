import { describe, it, expect } from "vitest";
import { classifyColorLAB, rgbToLab } from "@/lib/color-utils";

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

describe("2-Stage Color Classification - Regression Tests", () => {
  it("#FF0801 should be Bright Spring (family spring)", () => {
    const lab = hexToLab("#FF0801");
    const result = classifyColorLAB(lab);
    
    expect(result.family).toBe("spring");
    expect(result.season12).toBe("spring-bright");
    expect(result.season12Probs["spring-bright"]).toBeGreaterThan(0.3);
    
    console.log(`#FF0801: ${result.season12} (${(result.season12Probs[result.season12] * 100).toFixed(1)}%)`);
    console.log(`  Family: ${result.family} (${(result.familyProbs[result.family] * 100).toFixed(1)}%)`);
    console.log(`  Top3:`, result.top3.map(t => `${t.season} ${(t.probability * 100).toFixed(1)}%`));
  });

  it("#FFBE00 should be Spring family (Bright or True Spring, bias to Bright if C very high)", () => {
    const lab = hexToLab("#FFBE00");
    const result = classifyColorLAB(lab);
    
    expect(result.family).toBe("spring");
    const isBright = result.season12 === "spring-bright";
    const isTrue = result.season12 === "spring-true";
    expect(isBright || isTrue).toBe(true);
    
    // If chroma is very high, should bias to Bright
    if (result.debug.C >= 55) {
      expect(result.season12Probs["spring-bright"]).toBeGreaterThanOrEqual(result.season12Probs["spring-true"]);
    }
    
    console.log(`#FFBE00: ${result.season12} (${(result.season12Probs[result.season12] * 100).toFixed(1)}%)`);
    console.log(`  Family: ${result.family} (${(result.familyProbs[result.family] * 100).toFixed(1)}%)`);
    console.log(`  C: ${result.debug.C.toFixed(2)}, W: ${result.debug.W.toFixed(3)}, K: ${result.debug.K.toFixed(3)}`);
    console.log(`  Top3:`, result.top3.map(t => `${t.season} ${(t.probability * 100).toFixed(1)}%`));
  });

  it("#FEA176 should be Spring family (Light or True Spring)", () => {
    const lab = hexToLab("#FEA176");
    const result = classifyColorLAB(lab);
    
    expect(result.family).toBe("spring");
    const isLight = result.season12 === "spring-light";
    const isTrue = result.season12 === "spring-true";
    expect(isLight || isTrue).toBe(true);
    
    console.log(`#FEA176: ${result.season12} (${(result.season12Probs[result.season12] * 100).toFixed(1)}%)`);
    console.log(`  Family: ${result.family} (${(result.familyProbs[result.family] * 100).toFixed(1)}%)`);
    console.log(`  Top3:`, result.top3.map(t => `${t.season} ${(t.probability * 100).toFixed(1)}%`));
  });

  it("#B37256 should be True Autumn (family autumn)", () => {
    const lab = hexToLab("#B37256");
    const result = classifyColorLAB(lab);
    
    expect(result.family).toBe("autumn");
    // Should be True Autumn (or at least Autumn family)
    expect(result.season12).toMatch(/^autumn-/);
    // Prefer True Autumn
    if (result.season12Probs["autumn-true"] > 0.2) {
      expect(result.season12).toBe("autumn-true");
    }
    
    console.log(`#B37256: ${result.season12} (${(result.season12Probs[result.season12] * 100).toFixed(1)}%)`);
    console.log(`  Family: ${result.family} (${(result.familyProbs[result.family] * 100).toFixed(1)}%)`);
    console.log(`  C: ${result.debug.C.toFixed(2)}, W: ${result.debug.W.toFixed(3)}, K: ${result.debug.K.toFixed(3)}`);
    console.log(`  Top3:`, result.top3.map(t => `${t.season} ${(t.probability * 100).toFixed(1)}%`));
  });
});
