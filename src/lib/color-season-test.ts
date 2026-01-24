// Color Season Test Logic - Maps test answers to 12 color seasons

export type Undertone = 'warm' | 'cool' | 'neutral';
export type Chroma = 'bright' | 'soft' | 'neutral';
export type Value = 'light' | 'medium' | 'deep' | 'neutral';

export interface TestAnswers {
  undertone: Undertone;
  chroma: Chroma;
  value: Value;
}

// Lookup table mapping characteristics to color seasons
const SEASON_LOOKUP: Record<string, string> = {
  // Warm + Bright combinations -> Spring
  'warm-bright-light': 'spring-light',
  'warm-bright-medium': 'spring-bright',
  'warm-bright-deep': 'spring-bright',
  'warm-bright-neutral': 'spring-bright',
  
  // Warm + Soft combinations -> Autumn
  'warm-soft-light': 'autumn-soft',
  'warm-soft-medium': 'autumn-true',
  'warm-soft-deep': 'autumn-deep',
  'warm-soft-neutral': 'autumn-true',
  
  // Warm + Neutral chroma
  'warm-neutral-light': 'spring-light',
  'warm-neutral-medium': 'spring-true',
  'warm-neutral-deep': 'autumn-deep',
  'warm-neutral-neutral': 'spring-true',
  
  // Cool + Bright combinations -> Winter
  'cool-bright-light': 'winter-bright',
  'cool-bright-medium': 'winter-true',
  'cool-bright-deep': 'winter-deep',
  'cool-bright-neutral': 'winter-bright',
  
  // Cool + Soft combinations -> Summer
  'cool-soft-light': 'summer-light',
  'cool-soft-medium': 'summer-soft',
  'cool-soft-deep': 'summer-true',
  'cool-soft-neutral': 'summer-soft',
  
  // Cool + Neutral chroma
  'cool-neutral-light': 'summer-light',
  'cool-neutral-medium': 'summer-true',
  'cool-neutral-deep': 'winter-deep',
  'cool-neutral-neutral': 'summer-true',
  
  // Neutral undertone + Bright
  'neutral-bright-light': 'spring-light',
  'neutral-bright-medium': 'winter-bright',
  'neutral-bright-deep': 'winter-deep',
  'neutral-bright-neutral': 'spring-bright',
  
  // Neutral undertone + Soft
  'neutral-soft-light': 'summer-light',
  'neutral-soft-medium': 'autumn-soft',
  'neutral-soft-deep': 'autumn-deep',
  'neutral-soft-neutral': 'summer-soft',
  
  // All neutral (fallback to true types)
  'neutral-neutral-light': 'summer-light',
  'neutral-neutral-medium': 'autumn-true',
  'neutral-neutral-deep': 'autumn-deep',
  'neutral-neutral-neutral': 'summer-true',
};

export function determineColorSeason(answers: TestAnswers): string {
  const key = `${answers.undertone}-${answers.chroma}-${answers.value}`;
  return SEASON_LOOKUP[key] || 'summer-true'; // Default fallback
}

export function getConfidenceLevel(answers: TestAnswers): 'high' | 'medium' | 'low' {
  const neutralCount = [
    answers.undertone === 'neutral',
    answers.chroma === 'neutral',
    answers.value === 'neutral',
  ].filter(Boolean).length;
  
  if (neutralCount === 0) return 'high';
  if (neutralCount === 1) return 'medium';
  return 'low';
}
