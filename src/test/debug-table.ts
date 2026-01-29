/**
 * Debug table function (node-safe, not window-dependent)
 * Prints CSV output for anchor colors analysis
 */

import { classifyColorLAB, rgbToLab } from "@/lib/color-utils";
import { SEASON_ANCHORS } from "./season-anchors";

// Node.js file system (only if available)
let fs: typeof import("fs") | null = null;
let path: typeof import("path") | null = null;

try {
  fs = require("fs");
  path = require("path");
} catch {
  // Not in Node.js environment, fs/path will be null
}

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
export function generateDebugTable(): string {
  const lines: string[] = [];
  
  // Header
  lines.push('hex,L,a,b,C,W,V,K0,Vgate,Vscale,Keff,pClear,familySumBeforeNorm,familyScores,chosenFamily,subScores,season12,top3');
  
  // Data rows
  for (const anchor of SEASON_ANCHORS) {
    const lab = hexToLab(anchor.hex);
    const result = classifyColorLAB(lab);
    
    const row = [
      anchor.hex,
      result.debug.L.toFixed(1),
      result.debug.a.toFixed(1),
      result.debug.b.toFixed(1),
      result.debug.C.toFixed(2),
      result.debug.W.toFixed(3),
      result.debug.V.toFixed(3),
      result.debug.K0.toFixed(3),
      result.debug.Vgate.toFixed(3),
      result.debug.Vscale.toFixed(3),
      result.debug.Keff.toFixed(3),
      result.debug.pClear.toFixed(3),
      result.debug.familySumBeforeNorm.toFixed(3),
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
 * Save debug table to snapshot file (Node.js only)
 */
export function saveDebugTableSnapshot(outputPath?: string): void {
  if (!fs || !path) {
    console.warn('File system not available, cannot save snapshot');
    return;
  }
  
  const csv = generateDebugTable();
  const filePath = outputPath || path.join(__dirname, 'season-anchors-snapshot.csv');
  
  fs.writeFileSync(filePath, csv, 'utf-8');
  console.log(`Debug table saved to: ${filePath}`);
}

// If run directly (node debug-table.ts)
if (typeof require !== 'undefined' && require.main === module) {
  const csv = generateDebugTable();
  console.log(csv);
  saveDebugTableSnapshot();
}
