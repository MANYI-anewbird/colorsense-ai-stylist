/**
 * Parameter sweep utility to find optimal wb and C_ref values
 * Tests a grid of parameter combinations and selects the one with highest accuracy
 */

import { classifyColorLAB, type ClassificationConfig, DEFAULT_CLASSIFICATION_CONFIG } from "@/lib/color-utils";
import { SEASON_ANCHORS } from "./season-anchors";
import { rgbToLab } from "@/lib/color-utils";

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

/**
 * Evaluate a configuration on anchor colors
 * Returns: { accuracy, correctCount, totalCount, details }
 */
export function evaluateConfig(config: ClassificationConfig): {
  accuracy: number;
  correctCount: number;
  totalCount: number;
  details: Array<{
    hex: string;
    expected: string;
    predicted: string;
    correct: boolean;
  }>;
} {
  let correctCount = 0;
  const details: Array<{ hex: string; expected: string; predicted: string; correct: boolean }> = [];
  
  for (const anchor of SEASON_ANCHORS) {
    const lab = hexToLab(anchor.hex);
    const result = classifyColorLAB(lab, config);
    
    const correct = result.season12 === anchor.expectedSeason12;
    if (correct) correctCount++;
    
    details.push({
      hex: anchor.hex,
      expected: anchor.expectedSeason12,
      predicted: result.season12,
      correct,
    });
  }
  
  const totalCount = SEASON_ANCHORS.length;
  const accuracy = correctCount / totalCount;
  
  return { accuracy, correctCount, totalCount, details };
}

/**
 * Run parameter sweep
 * Tests wb in [wbMin, wbMax] and C_ref in [C_refMin, C_refMax]
 */
export function parameterSweep(
  wbMin: number = 10,
  wbMax: number = 20,
  wbStep: number = 2,
  C_refMin: number = 40,
  C_refMax: number = 70,
  C_refStep: number = 5
): {
  bestConfig: ClassificationConfig;
  bestAccuracy: number;
  results: Array<{ wb: number; C_ref: number; accuracy: number }>;
} {
  const results: Array<{ wb: number; C_ref: number; accuracy: number }> = [];
  let bestAccuracy = 0;
  let bestConfig: ClassificationConfig = DEFAULT_CLASSIFICATION_CONFIG;
  
  console.log(`Running parameter sweep: wb [${wbMin}..${wbMax}] step ${wbStep}, C_ref [${C_refMin}..${C_refMax}] step ${C_refStep}`);
  console.log(`Total combinations: ${Math.floor((wbMax - wbMin) / wbStep + 1) * Math.floor((C_refMax - C_refMin) / C_refStep + 1)}`);
  
  for (let wb = wbMin; wb <= wbMax; wb += wbStep) {
    for (let C_ref = C_refMin; C_ref <= C_refMax; C_ref += C_refStep) {
      const config: ClassificationConfig = {
        ...DEFAULT_CLASSIFICATION_CONFIG,
        wb,
        C_ref,
      };
      
      const { accuracy } = evaluateConfig(config);
      results.push({ wb, C_ref, accuracy });
      
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestConfig = config;
      }
      
      process.stdout.write(`wb=${wb}, C_ref=${C_ref}: ${(accuracy * 100).toFixed(1)}%\r`);
    }
  }
  
  console.log('\n');
  console.log(`Best configuration: wb=${bestConfig.wb}, C_ref=${bestConfig.C_ref}`);
  console.log(`Best accuracy: ${(bestAccuracy * 100).toFixed(1)}%`);
  
  // Show top 5 results
  results.sort((a, b) => b.accuracy - a.accuracy);
  console.log('\nTop 5 configurations:');
  for (let i = 0; i < Math.min(5, results.length); i++) {
    const r = results[i];
    console.log(`  ${i + 1}. wb=${r.wb}, C_ref=${r.C_ref}: ${(r.accuracy * 100).toFixed(1)}%`);
  }
  
  return { bestConfig, bestAccuracy, results };
}

// If run directly (node parameter-sweep.ts)
if (typeof require !== 'undefined' && require.main === module) {
  const { bestConfig, bestAccuracy, results } = parameterSweep();
  
  console.log('\n=== Best Configuration ===');
  console.log(JSON.stringify(bestConfig, null, 2));
  console.log(`\nAccuracy: ${(bestAccuracy * 100).toFixed(1)}%`);
  
  // Evaluate best config with details
  const { details } = evaluateConfig(bestConfig);
  const incorrect = details.filter(d => !d.correct);
  if (incorrect.length > 0) {
    console.log('\n=== Incorrect Classifications ===');
    incorrect.forEach(d => {
      console.log(`  ${d.hex}: expected ${d.expected}, got ${d.predicted}`);
    });
  }
}
