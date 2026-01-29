/**
 * Anchor colors for 12-season classification regression testing
 * 2 anchors per subseason (24 total)
 */

export interface SeasonAnchor {
  hex: string;
  expectedFamily: 'spring' | 'summer' | 'autumn' | 'winter';
  expectedSeason12: 
    | 'spring-light' | 'spring-true' | 'spring-bright'
    | 'summer-light' | 'summer-true' | 'summer-soft'
    | 'autumn-soft' | 'autumn-true' | 'autumn-deep'
    | 'winter-bright' | 'winter-true' | 'winter-deep';
  note: string; // Description of why this color represents the season
}

export const SEASON_ANCHORS: SeasonAnchor[] = [
  // Spring Light (2 anchors)
  {
    hex: '#FEA176',
    expectedFamily: 'spring',
    expectedSeason12: 'spring-light',
    note: 'Light warm peach - typical Light Spring',
  },
  {
    hex: '#FFD4A3',
    expectedFamily: 'spring',
    expectedSeason12: 'spring-light',
    note: 'Light warm cream - Light Spring',
  },
  
  // Spring True (2 anchors)
  {
    hex: '#FFBE00',
    expectedFamily: 'spring',
    expectedSeason12: 'spring-true',
    note: 'Warm golden yellow - True Spring',
  },
  {
    hex: '#FF8C42',
    expectedFamily: 'spring',
    expectedSeason12: 'spring-true',
    note: 'Warm coral orange - True Spring',
  },
  
  // Spring Bright (2 anchors)
  {
    hex: '#FF0801',
    expectedFamily: 'spring',
    expectedSeason12: 'spring-bright',
    note: 'Very high chroma warm red - Bright Spring',
  },
  {
    hex: '#00FF41',
    expectedFamily: 'spring',
    expectedSeason12: 'spring-bright',
    note: 'Vivid warm green - Bright Spring',
  },
  
  // Summer Light (2 anchors)
  {
    hex: '#E8D5C4',
    expectedFamily: 'summer',
    expectedSeason12: 'summer-light',
    note: 'Light cool beige - Light Summer',
  },
  {
    hex: '#D4E8F0',
    expectedFamily: 'summer',
    expectedSeason12: 'summer-light',
    note: 'Light cool blue - Light Summer',
  },
  
  // Summer True (2 anchors)
  {
    hex: '#8FA3B8',
    expectedFamily: 'summer',
    expectedSeason12: 'summer-true',
    note: 'Dusty cool blue - True Summer',
  },
  {
    hex: '#B8A8A8',
    expectedFamily: 'summer',
    expectedSeason12: 'summer-true',
    note: 'Muted cool rose - True Summer',
  },
  
  // Summer Soft (2 anchors)
  {
    hex: '#C4B5A8',
    expectedFamily: 'summer',
    expectedSeason12: 'summer-soft',
    note: 'Soft cool taupe - Soft Summer',
  },
  {
    hex: '#A8B8C4',
    expectedFamily: 'summer',
    expectedSeason12: 'summer-soft',
    note: 'Soft cool grey-blue - Soft Summer',
  },
  
  // Autumn Soft (2 anchors)
  {
    hex: '#B8A088',
    expectedFamily: 'autumn',
    expectedSeason12: 'autumn-soft',
    note: 'Soft warm beige - Soft Autumn',
  },
  {
    hex: '#A88C70',
    expectedFamily: 'autumn',
    expectedSeason12: 'autumn-soft',
    note: 'Soft warm taupe - Soft Autumn',
  },
  
  // Autumn True (2 anchors)
  {
    hex: '#B37256',
    expectedFamily: 'autumn',
    expectedSeason12: 'autumn-true',
    note: 'Warm earthy brown - True Autumn',
  },
  {
    hex: '#D4A070',
    expectedFamily: 'autumn',
    expectedSeason12: 'autumn-true',
    note: 'Warm caramel - True Autumn',
  },
  
  // Autumn Deep (2 anchors)
  {
    hex: '#8C5C42',
    expectedFamily: 'autumn',
    expectedSeason12: 'autumn-deep',
    note: 'Deep warm brown - Deep Autumn',
  },
  {
    hex: '#704228',
    expectedFamily: 'autumn',
    expectedSeason12: 'autumn-deep',
    note: 'Deep warm chocolate - Deep Autumn',
  },
  
  // Winter Bright (2 anchors)
  {
    hex: '#00A2FF',
    expectedFamily: 'winter',
    expectedSeason12: 'winter-bright',
    note: 'Vivid cool blue - Bright Winter',
  },
  {
    hex: '#FF0041',
    expectedFamily: 'winter',
    expectedSeason12: 'winter-bright',
    note: 'Vivid cool fuchsia - Bright Winter',
  },
  
  // Winter True (2 anchors)
  {
    hex: '#4A5C8C',
    expectedFamily: 'winter',
    expectedSeason12: 'winter-true',
    note: 'Cool navy blue - True Winter',
  },
  {
    hex: '#5C2842',
    expectedFamily: 'winter',
    expectedSeason12: 'winter-true',
    note: 'Cool deep burgundy - True Winter',
  },
  
  // Winter Deep (2 anchors)
  {
    hex: '#282842',
    expectedFamily: 'winter',
    expectedSeason12: 'winter-deep',
    note: 'Deep cool navy - Deep Winter',
  },
  {
    hex: '#421828',
    expectedFamily: 'winter',
    expectedSeason12: 'winter-deep',
    note: 'Deep cool burgundy - Deep Winter',
  },
];
