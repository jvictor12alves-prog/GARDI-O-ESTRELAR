export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Vector2D;
  width: number;
  height: number;
  color: string;
  markedForDeletion: boolean;
}

export interface Player extends Entity {
  speed: number;
  cooldown: number;
  hp: number;
}

export interface Enemy extends Entity {
  speed: number;
  hp: number;
  type: 'basic' | 'fast' | 'tank';
}

export interface Bullet extends Entity {
  velocity: Vector2D;
  isEnemy: boolean;
  damage: number;
}

export interface Particle extends Entity {
  velocity: Vector2D;
  life: number;
  maxLife: number;
}

export interface GameMetrics {
  score: number;
  wave: number;
  shotsFired: number;
  enemiesDestroyed: number;
  accuracy: number;
}