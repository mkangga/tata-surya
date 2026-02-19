export interface MoonConfig {
  name: string;
  radius: number;
  distance: number; // Pixels from planet center
  speed: number; // Orbital speed relative to simulation
  color: string;
  description: string;
  type?: 'moon';
}

export interface PlanetConfig {
  name: string;
  color: string; // Base color
  colors: string[]; // Array for gradients/textures
  radius: number;
  distance: number; // Semi-major axis in AU
  eccentricity: number; // 0 = circle, >0 = ellipse
  speed: number; // Orbital speed relative to simulation
  description: string;
  type: 'star' | 'planet' | 'dwarf' | 'comet';
  hasRing?: boolean;
  moons?: MoonConfig[]; 
  // Detailed stats
  diameter: string;
  temp: string;
  dayLength: string;
  yearLength: string;
  funFact: string;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string; // Star temperature color
}

export interface Asteroid {
  angle: number;
  distance: number; 
  speed: number;
  size: number;
  offset: number; 
}

export interface PlanetRuntimeState {
  name: string;
  angle: number; // Current orbital angle (Mean anomaly approx)
  visualX: number;
  visualY: number;
  trail: {x: number, y: number}[]; 
  moons: { angle: number }[]; 
}

export interface SimulationState {
  scale: number;
  speedMultiplier: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  lastMouseX: number;
  lastMouseY: number;
  isPlaying: boolean;
  simulationDate: number; 
}