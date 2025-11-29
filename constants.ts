export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 40;
export const PLAYER_SPEED = 7;
export const PLAYER_COLOR = '#3b82f6'; // blue-500
export const PLAYER_COOLDOWN = 15; // frames

export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 10;
export const BULLET_SPEED = 10;

export const ENEMY_SPAWN_RATE_BASE = 60; // frames
export const PARTICLE_LIFE = 30;

export const KEYS = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  SHOOT: ' '
};

// Responsiveness helper
export const getScale = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  // Fit into window while maintaining aspect ratio if possible, or just fill
  const scaleX = width / CANVAS_WIDTH;
  const scaleY = height / CANVAS_HEIGHT;
  return Math.min(scaleX, scaleY, 1);
};