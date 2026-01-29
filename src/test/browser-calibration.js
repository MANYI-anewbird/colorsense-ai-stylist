/**
 * Browser-based calibration runner
 * Paste this into browser console when app is running
 * 
 * Usage:
 * 1. Open app in browser
 * 2. Open console
 * 3. Paste this entire file
 * 4. Run: runCalibration()
 */

// Import the classification function (adjust path as needed)
// This assumes the function is available globally or via window

async function runCalibration() {
  console.log('=== Calibration Runner ===\n');
  
  // Anchor colors (from season-anchors.ts)
  const anchors = [
    { hex: '#FEA176', expected: 'spring-light', family: 'spring' },
    { hex: '#FFD4A3', expected: 'spring-light', family: 'spring' },
    { hex: '#FFBE00', expected: 'spring-true', family: 'spring' },
    { hex: '#FF8C42', expected: 'spring-true', family: 'spring' },
    { hex: '#FF0801', expected: 'spring-bright', family: 'spring' },
    { hex: '#00FF41', expected: 'spring-bright', family: 'spring' },
    { hex: '#E8D5C4', expected: 'summer-light', family: 'summer' },
    { hex: '#D4E8F0', expected: 'summer-light', family: 'summer' },
    { hex: '#8FA3B8', expected: 'summer-true', family: 'summer' },
    { hex: '#B8A8A8', expected: 'summer-true', family: 'summer' },
    { hex: '#C4B5A8', expected: 'summer-soft', family: 'summer' },
    { hex: '#A8B8C4', expected: 'summer-soft', family: 'summer' },
    { hex: '#B8A088', expected: 'autumn-soft', family: 'autumn' },
    { hex: '#A88C70', expected: 'autumn-soft', family: 'autumn' },
    { hex: '#B37256', expected: 'autumn-true', family: 'autumn' },
    { hex: '#D4A070', expected: 'autumn-true', family: 'autumn' },
    { hex: '#8C5C42', expected: 'autumn-deep', family: 'autumn' },
    { hex: '#704228', expected: 'autumn-deep', family: 'autumn' },
    { hex: '#00A2FF', expected: 'winter-bright', family: 'winter' },
    { hex: '#FF0041', expected: 'winter-bright', family: 'winter' },
    { hex: '#4A5C8C', expected: 'winter-true', family: 'winter' },
    { hex: '#5C2842', expected: 'winter-true', family: 'winter' },
    { hex: '#282842', expected: 'winter-deep', family: 'winter' },
    { hex: '#421828', expected: 'winter-deep', family: 'winter' },
  ];
  
  // Helper to convert hex to RGB
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }
  
  // Test each anchor
  const results = [];
  let correctCount = 0;
  const failures = [];
  
  console.log('Testing 24 anchor colors...\n');
  
  for (const anchor of anchors) {
    const rgb = hexToRgb(anchor.hex);
    
    // Use the app's color analysis (adjust based on your app structure)
    // This is a placeholder - you'll need to adapt to your actual API
    try {
      // Option 1: If you have a global function
      // const result = window.analyzeColor(rgb.r, rgb.g, rgb.b);
      
      // Option 2: If you can access the classification directly
      // const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
      // const result = classifyColorLAB({ L: lab.l, a: lab.a, b: lab.b });
      
      // For now, this is a template - replace with actual classification call
      console.log(`Testing ${anchor.hex}...`);
      
      // Placeholder result structure
      const result = {
        season12: 'unknown', // Replace with actual result
        family: 'unknown',
        confidence: 0,
        top3: [],
      };
      
      const correct = result.season12 === anchor.expected;
      const familyCorrect = result.family === anchor.family;
      
      if (correct) {
        correctCount++;
      } else {
        failures.push({
          hex: anchor.hex,
          expected: anchor.expected,
          got: result.season12,
          familyCorrect,
          confidence: result.confidence,
          top3: result.top3,
        });
      }
      
      results.push({
        hex: anchor.hex,
        expected: anchor.expected,
        got: result.season12,
        correct,
        familyCorrect,
      });
    } catch (e) {
      console.error(`Error testing ${anchor.hex}:`, e);
    }
  }
  
  // Print results
  console.log(`\n=== Results ===`);
  console.log(`Accuracy: ${(correctCount / anchors.length * 100).toFixed(1)}% (${correctCount}/${anchors.length})`);
  
  if (failures.length > 0) {
    console.log(`\n=== Failures (${failures.length}) ===`);
    failures.forEach(f => {
      console.log(`${f.hex}: expected ${f.expected}, got ${f.got} (family: ${f.familyCorrect ? '✓' : '✗'}), confidence: ${(f.confidence * 100).toFixed(1)}%, top3: ${f.top3.map(t => `${t.season}:${(t.probability * 100).toFixed(1)}%`).join(';')}`);
    });
    
    // Categorize
    const wrongFamily = failures.filter(f => !f.familyCorrect);
    const wrongSubseason = failures.filter(f => f.familyCorrect);
    
    console.log(`\n=== Categorization ===`);
    console.log(`Wrong family: ${wrongFamily.length}`);
    wrongFamily.forEach(f => console.log(`  ${f.hex}: ${f.expected} → ${f.got}`));
    
    console.log(`\nCorrect family, wrong subseason: ${wrongSubseason.length}`);
    wrongSubseason.forEach(f => console.log(`  ${f.hex}: ${f.expected} → ${f.got}`));
  }
  
  return { results, failures, accuracy: correctCount / anchors.length };
}

// Export for use
if (typeof window !== 'undefined') {
  window.runCalibration = runCalibration;
  console.log('Calibration runner loaded. Run: runCalibration()');
}
