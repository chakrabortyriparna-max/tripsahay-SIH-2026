export interface Trip {
  id: string;
  year: number;
  title: string;
  subtitle: string;
  distanceKm: number;
  days: number;
  status: 'recovered' | 'parsed' | 'pending';
  category: 'WALK' | 'ROADTRIP' | 'FERRY' | 'HILLS';
  date: string;
  pointsCount: number;
}

export interface LectureChapter {
  id: string;
  code: string;
  title: string;
  duration: string;
  description: string;
  category: string;
  accent: string;
  formula: string;
}

export interface Postcard {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  description: string;
  svgType: 'pilgrims' | 'lamp' | 'ripples' | 'walk_home';
  date: string;
  location: string;
  bgHex: string;
  accentHex: string;
}

export interface OilShaderSettings {
  vibrancy: number;
  speed: number;
  swirlStrength: number;
  hueShift: number;
  theme: 'hyper_rainbow' | 'deep_opal' | 'solar_flare' | 'aurora_borealis' | 'ultraviolet';
}
