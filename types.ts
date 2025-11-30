export enum GameState {
  MENU = 'MENU',
  TRAINING_MENU = 'TRAINING_MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum ObstacleType {
  NORMAL = 'NORMAL',
  SINE = 'SINE',      // Moves in curves
  DIAGONAL = 'DIAGONAL', // Moves sideways
  CHASER = 'CHASER',    // Slowly tracks player
  ZIGZAG = 'ZIGZAG',    // Sharp side-to-side movement
  PULSING = 'PULSING'   // Expands and contracts
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  type: ObstacleType;
  initialX: number; // Reference for sine/zigzag
  initialWidth: number; // Reference for pulsing
  timeOffset: number; // Random offset for wave phase
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface Point {
  x: number;
  y: number;
}