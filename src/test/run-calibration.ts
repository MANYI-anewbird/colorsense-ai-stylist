/**
 * Calibration runner script
 * Runs tests, parameter sweep, and generates debug tables
 */

import { classifyColorLAB, DEFAULT_CLASSIFICATION_CONFIG, type ClassificationConfig } from "@/lib/color-utils";
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
 * Format family scores as string
 */
function formatFamilyScores(scores: Record<string, number>): string {
  return `spring:${scores.spring.toFixed(3)},autumn:${scores.autumn.toFixed(3)},summer:${scores.summer.toFixed(3)},winter:${scores.winter.toFixed(3)}`;
}

/**
 * Format subseason scores as string (only non-zero)
 */
function formatSubScores(scores: Record<string, number>, family: string): string {
  const familySeasons = 
    family === 'spring' ? ['spring-light', 'spring-true', 'spring-bright'] :
    family === 'autumn' ? ['autumn-soft', 'autumn-true', 'autumn-deep'] :
    family === 'summer' ? ['summer-light', 'summer-true', 'summer-soft'] :
    ['winter-bright', 'winter-true', 'winter-deep'];
  
  return familySeasons.map(s => `${s}:${scores[s].toFixed(3)}`).join(',');
}

/**
 * Format top3 as string
 */
function formatTop3(top3: Array<{ season: string; probability: number }>): string {
  return top3.map(t => `${t.season}:${(t.probability * 100).toFixed(1)}%`).join(';');
}

/**
 * Generate debug table CSV
 */
function generateDebugTable(config: ClassificationConfig = DEFAULT_CLASSIFICATION_CONFIG): string {
  const lines: string[] = [];
  
  // Header
  lines.push('hex,L,a,b,C,W,V,K,familyScores,chosenFamily,subScores,season12,top3');
  
  // Data rows
  for (const anchor of SEASON_ANCHORS) {
    const lab = hexToLab(anchor.hex);
    const result = classifyColorLAB(lab, config);
    
    const row = [
      anchor.hex,
      result.debug.L.toFixed(1),
      result.debug.a.toFixed(1),
      result.debug.b.toFixed(1),
      result.debug.C.toFixed(2),
      result.debug.W.toFixed(3),
      result.debug.V.toFixed(3),
      result.debug.K.toFixed(3),
      formatFamilyScores(result.debug.familyScores),
      result.family,
      formatSubScores(result.debug.subseasonScores, result.family),
      result.season12,
      formatTop3(result.top3),
    ].join(',');
    
    lines.push(row);
  }
  
  return lines.join('\n');
}

/**
 * Evaluate a configuration on anchor colors
 */
function evaluateConfig(config: ClassificationConfig): {
  accuracy: number;
  correctCount: number;
  totalCount: number;
  failures: Array<{
    hex: string;
    expected: string;
    got: string;
    top3: string;
    confidence: number;
    familyCorrect: boolean;
  }>;
} {
  let correctCount = 0;
  const failures: Array<{
    hex: string;
    expected: string;
    got: string;
    top3: string;
    confidence: number;
    familyCorrect: boolean;
  }> = [];
  
  for (const anchor of SEASON_ANCHORS) {
    const lab = hexToLab(anchor.hex);
    const result = classifyColorLAB(lab, config);
    
    const correct = result.season12 === anchor.expectedSeason12;
    const familyCorrect = result.family === anchor.expectedFamily;
    
    if (!correct) {
      failures.push({
        hex: anchor.hex,
        expected: anchor.expectedSeason12,
        got: result.season12,
        top3: formatTop3(result.top3),
        confidence: result.season12Probs[result.season12],
        familyCorrect,
      });
    } else {
      correctCount++;
    }
  }
  
  const totalCount = SEASON_ANCHORS.length;
  const accuracy = correctCount / totalCount;
  
  return { accuracy, correctCount, totalCount, failures };
}

/**
 * Run parameter sweep
 */
function parameterSweep(
  wbMin: number = 10,
  wbMax: number = 20,
  wbStep: number = 2,
  C_refMin: number = 40,
  C_refMax: number = 70,
  C_refStep: number = 5
): {
  bestConfig: ClassificationConfig;
  bestAccuracy: number;
  top5: Array<{ wb: number; C_ref: number; accuracy: number }>;
} {
  const results: Array<{ wb: number; C_ref: number; accuracy: number }> = [];
  let bestAccuracy = 0;
  let bestConfig: ClassificationConfig = DEFAULT_CLASSIFICATION_CONFIG;
  
  console.log(`Running parameter sweep: wb [${wbMin}..${wbMax}] step ${wbStep}, C_ref [${C_refMin}..${C_refMax}] step ${C_refStep}`);
  
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
    }
  }
  
  // Sort and get top 5
  results.sort((a, b) => b.accuracy - a.accuracy);
  const top5 = results.slice(0, 5);
  
  return { bestConfig, bestAccuracy, top5 };
}

// Main execution
console.log('=== 1. Running Season Anchors Test (DEFAULT config) ===\n');
const defaultResults = evaluateConfig(DEFAULT_CLASSIFICATION_CONFIG);
console.log(`Accuracy: ${(defaultResults.accuracy * 100).toFixed(1)}% (${defaultResults.correctCount}/${defaultResults.totalCount})`);
console.log(`\nFailing anchors (${defaultResults.failures.length}):`);
defaultResults.failures.forEach(f => {
  console.log(`  ${f.hex}: expected ${f.expected}, got ${f.got} (family: ${f.familyCorrect ? '✓' : '✗'}), confidence: ${(f.confidence * 100).toFixed(1)}%, top3: ${f.top3}`);
});

console.log('\n=== 2. Running Parameter Sweep ===\n');
const sweepResults = parameterSweep();
console.log(`Best config: wb=${sweepResults.bestConfig.wb}, C_ref=${sweepResults.bestConfig.C_ref}`);
console.log(`Best accuracy: ${(sweepResults.bestAccuracy * 100).toFixed(1)}%`);
console.log('\nTop 5 configurations:');
sweepResults.top5.forEach((r, i) => {
  console.log(`  ${i + 1}. wb=${r.wb}, C_ref=${r.C_ref}: ${(r.accuracy * 100).toFixed(1)}%`);
});

console.log('\n=== 3. Evaluating BEST config ===\n');
const bestResults = evaluateConfig(sweepResults.bestConfig);
console.log(`Accuracy: ${(bestResults.accuracy * 100).toFixed(1)}% (${bestResults.correctCount}/${bestResults.totalCount})`);
if (bestResults.failures.length > 0) {
  console.log(`\nRemaining failures (${bestResults.failures.length}):`);
  bestResults.failures.forEach(f => {
    console.log(`  ${f.hex}: expected ${f.expected}, got ${f.got} (family: ${f.familyCorrect ? '✓' : '✗'}), confidence: ${(f.confidence * 100).toFixed(1)}%, top3: ${f.top3}`);
  });
}

console.log('\n=== 4. Generating Debug Tables ===\n');
const defaultTable = generateDebugTable(DEFAULT_CLASSIFICATION_CONFIG);
const bestTable = generateDebugTable(sweepResults.bestConfig);

// Save to files (if fs available)
try {
  const fs = require('fs');
  const path = require('path');
  const defaultPath = path.join(__dirname, 'season-anchors-snapshot-default.csv');
  const bestPath = path.join(__dirname, 'season-anchors-snapshot-best.csv');
  
  fs.writeFileSync(defaultPath, defaultTable, 'utf-8');
  fs.writeFileSync(bestPath, bestTable, 'utf-8');
  
  console.log(`Saved DEFAULT config snapshot: ${defaultPath}`);
  console.log(`Saved BEST config snapshot: ${bestPath}`);
} catch (e) {
  console.log('Could not save files (fs not available), outputting to console:');
  console.log('\n--- DEFAULT config CSV ---');
  console.log(defaultTable);
  console.log('\n--- BEST config CSV ---');
  console.log(bestTable);
}

// Categorize failures
console.log('\n=== 5. Failure Analysis ===\n');
const wrongFamily = bestResults.failures.filter(f => !f.familyCorrect);
const wrongSubseason = bestResults.failures.filter(f => f.familyCorrect);

console.log(`Wrong family: ${wrongFamily.length}`);
wrongFamily.forEach(f => {
  console.log(`  ${f.hex}: expected ${f.expected}, got ${f.got}`);
});

console.log(`\nCorrect family, wrong subseason: ${wrongSubseason.length}`);
wrongSubseason.forEach(f => {
  console.log(`  ${f.hex}: expected ${f.expected}, got ${f.got}, confidence: ${(f.confidence * 100).toFixed(1)}%`);
});
