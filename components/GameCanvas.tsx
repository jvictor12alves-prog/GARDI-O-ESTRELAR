import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  GameState, 
  Player, 
  Enemy, 
  Bullet, 
  Particle,
  GameMetrics
} from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_WIDTH, 
  PLAYER_HEIGHT, 
  PLAYER_SPEED, 
  PLAYER_COLOR,
  PLAYER_COOLDOWN,
  BULLET_SPEED,
  ENEMY_SPAWN_RATE_BASE
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onGameOver: (metrics: GameMetrics) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, setGameState, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const waveRef = useRef<number>(1);
  const frameCountRef = useRef<number>(0);
  const isGameOverRef = useRef<boolean>(false);
  
  // Game Entities Refs (Mutable state for performance)
  const playerRef = useRef<Player>({
    id: 'player',
    pos: { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20 },
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    color: PLAYER_COLOR,
    speed: PLAYER_SPEED,
    cooldown: 0,
    hp: 3,
    markedForDeletion: false
  });
  
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  // Stats for metrics
  const shotsFiredRef = useRef<number>(0);
  const enemiesDestroyedRef = useRef<number>(0);

  // Input State
  const keysRef = useRef<{ [key: string]: boolean }>({});
  
  // Initialize inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Helper: Create explosion particles
  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        id: Math.random().toString(),
        pos: { x, y },
        width: 4,
        height: 4,
        color: color,
        markedForDeletion: false,
        velocity: { 
          x: (Math.random() - 0.5) * 10, 
          y: (Math.random() - 0.5) * 10 
        },
        life: 20 + Math.random() * 10,
        maxLife: 30
      });
    }
  };

  const resetGame = useCallback(() => {
    scoreRef.current = 0;
    waveRef.current = 1;
    frameCountRef.current = 0;
    shotsFiredRef.current = 0;
    enemiesDestroyedRef.current = 0;
    isGameOverRef.current = false;
    
    playerRef.current = {
      id: 'player',
      pos: { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20 },
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      color: PLAYER_COLOR,
      speed: PLAYER_SPEED,
      cooldown: 0,
      hp: 1, // Classic arcade style: 1 hit death usually, but let's do 1 for now to make it challenging
      markedForDeletion: false
    };
    
    enemiesRef.current = [];
    bulletsRef.current = [];
    particlesRef.current = [];
  }, []);

  const triggerGameOver = useCallback(() => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;
    
    onGameOver({
      score: scoreRef.current,
      wave: waveRef.current,
      shotsFired: shotsFiredRef.current,
      enemiesDestroyed: enemiesDestroyedRef.current,
      accuracy: shotsFiredRef.current > 0 ? enemiesDestroyedRef.current / shotsFiredRef.current : 0
    });
  }, [onGameOver]);

  // Main Game Loop
  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING || isGameOverRef.current) return;

    const player = playerRef.current;
    
    // 1. Player Movement
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
      player.pos.x = Math.max(0, player.pos.x - player.speed);
    }
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
      player.pos.x = Math.min(CANVAS_WIDTH - player.width, player.pos.x + player.speed);
    }

    // 2. Shooting
    if (player.cooldown > 0) player.cooldown--;
    if (keysRef.current[' '] && player.cooldown <= 0) {
      bulletsRef.current.push({
        id: Math.random().toString(),
        pos: { x: player.pos.x + player.width / 2 - 2, y: player.pos.y },
        width: 4,
        height: 10,
        color: '#fbbf24', // amber-400
        markedForDeletion: false,
        velocity: { x: 0, y: -BULLET_SPEED },
        isEnemy: false,
        damage: 1
      });
      player.cooldown = PLAYER_COOLDOWN;
      shotsFiredRef.current++;
    }

    // 3. Enemy Spawning
    // Increase difficulty: spawn rate decreases (faster spawns) as score increases
    const spawnRate = Math.max(20, ENEMY_SPAWN_RATE_BASE - Math.floor(scoreRef.current / 500));
    if (frameCountRef.current % spawnRate === 0) {
      const typeChance = Math.random();
      let type: 'basic' | 'fast' | 'tank' = 'basic';
      let width = 30;
      let height = 30;
      let color = '#ef4444'; // red-500
      let hp = 1;
      let speed = 2 + (waveRef.current * 0.2);

      if (scoreRef.current > 500 && typeChance > 0.8) {
        type = 'tank';
        width = 50;
        height = 50;
        color = '#a855f7'; // purple-500
        hp = 3;
        speed = 1;
      } else if (scoreRef.current > 200 && typeChance > 0.6) {
        type = 'fast';
        width = 25;
        height = 25;
        color = '#f97316'; // orange-500
        hp = 1;
        speed = 4 + (waveRef.current * 0.3);
      }

      enemiesRef.current.push({
        id: Math.random().toString(),
        pos: { x: Math.random() * (CANVAS_WIDTH - width), y: -height },
        width,
        height,
        color,
        markedForDeletion: false,
        speed,
        hp,
        type
      });
    }

    // 4. Update Enemies
    enemiesRef.current.forEach(enemy => {
      enemy.pos.y += enemy.speed;
      
      // Check if enemy passed the bottom of the screen
      if (enemy.pos.y > CANVAS_HEIGHT) {
        // Enemy got past player - Remove it instead of killing player (fixes "phantom hitbox" confusion)
        enemy.markedForDeletion = true;
        return;
      }
      
      // Collision with Player
      // Adjusted Hitbox: Shrink the player's collision box significantly
      // This prevents "air" hits on the empty corners of the triangle ship
      const hitBoxPaddingX = 12; // Shrink width by 12px on each side
      const hitBoxPaddingY = 10; // Shrink height by 10px on top/bottom
      
      const pLeft = player.pos.x + hitBoxPaddingX;
      const pRight = player.pos.x + player.width - hitBoxPaddingX;
      const pTop = player.pos.y + hitBoxPaddingY;
      const pBottom = player.pos.y + player.height - 5; // Less padding at bottom

      if (
        pLeft < enemy.pos.x + enemy.width &&
        pRight > enemy.pos.x &&
        pTop < enemy.pos.y + enemy.height &&
        pBottom > enemy.pos.y
      ) {
        createExplosion(player.pos.x, player.pos.y, player.color);
        triggerGameOver();
      }
    });

    // 5. Update Bullets
    bulletsRef.current.forEach(bullet => {
      bullet.pos.y += bullet.velocity.y;
      
      // Out of bounds
      if (bullet.pos.y < 0 || bullet.pos.y > CANVAS_HEIGHT) {
        bullet.markedForDeletion = true;
      }
      
      // Collision with Enemies
      if (!bullet.isEnemy) {
        enemiesRef.current.forEach(enemy => {
          if (
            bullet.pos.x < enemy.pos.x + enemy.width &&
            bullet.pos.x + bullet.width > enemy.pos.x &&
            bullet.pos.y < enemy.pos.y + enemy.height &&
            bullet.pos.y + bullet.height > enemy.pos.y
          ) {
            bullet.markedForDeletion = true;
            enemy.hp -= bullet.damage;
            if (enemy.hp <= 0) {
              enemy.markedForDeletion = true;
              createExplosion(enemy.pos.x, enemy.pos.y, enemy.color);
              scoreRef.current += (enemy.type === 'tank' ? 50 : enemy.type === 'fast' ? 30 : 10);
              enemiesDestroyedRef.current++;
              
              // Wave progression logic
              const newWave = Math.floor(scoreRef.current / 1000) + 1;
              if (newWave > waveRef.current) {
                waveRef.current = newWave;
              }
            }
          }
        });
      }
    });

    // 6. Update Particles
    particlesRef.current.forEach(p => {
      p.pos.x += p.velocity.x;
      p.pos.y += p.velocity.y;
      p.life--;
      if (p.life <= 0) p.markedForDeletion = true;
    });

    // 7. Cleanup
    enemiesRef.current = enemiesRef.current.filter(e => !e.markedForDeletion);
    bulletsRef.current = bulletsRef.current.filter(b => !b.markedForDeletion);
    particlesRef.current = particlesRef.current.filter(p => !p.markedForDeletion);
    
    frameCountRef.current++;
  }, [gameState, triggerGameOver]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars background effect
    ctx.fillStyle = '#ffffff';
    for(let i=0; i<50; i++) {
        // Pseudo-random stars based on frame to simulate movement
        const x = (Math.sin(i * 132.1) * 43758.5453 + frameCountRef.current * 0.2) % CANVAS_WIDTH; 
        const y = (Math.cos(i * 432.1) * 23421.123 + frameCountRef.current * 1.5) % CANVAS_HEIGHT; 
        // We use Math.abs to ensure positive coords
        const realX = Math.abs(x);
        const realY = Math.abs(y);
        ctx.fillRect(realX, realY, Math.random() > 0.5 ? 2 : 1, Math.random() > 0.5 ? 2 : 1);
    }

    if (gameState === GameState.PLAYING) {
      // Draw Player
      ctx.fillStyle = playerRef.current.color;
      // Simple Triangle Ship
      ctx.beginPath();
      ctx.moveTo(playerRef.current.pos.x + playerRef.current.width / 2, playerRef.current.pos.y);
      ctx.lineTo(playerRef.current.pos.x + playerRef.current.width, playerRef.current.pos.y + playerRef.current.height);
      ctx.lineTo(playerRef.current.pos.x, playerRef.current.pos.y + playerRef.current.height);
      ctx.closePath();
      ctx.fill();
      
      // Engine Glow
      ctx.fillStyle = '#3b82f6';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(playerRef.current.pos.x + playerRef.current.width / 2, playerRef.current.pos.y + playerRef.current.height, 10 + Math.random() * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Draw Enemies
      enemiesRef.current.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        if (enemy.type === 'basic') {
          ctx.fillRect(enemy.pos.x, enemy.pos.y, enemy.width, enemy.height);
        } else if (enemy.type === 'fast') {
          ctx.beginPath();
          ctx.moveTo(enemy.pos.x + enemy.width / 2, enemy.pos.y + enemy.height);
          ctx.lineTo(enemy.pos.x, enemy.pos.y);
          ctx.lineTo(enemy.pos.x + enemy.width, enemy.pos.y);
          ctx.closePath();
          ctx.fill();
        } else if (enemy.type === 'tank') {
           ctx.fillRect(enemy.pos.x, enemy.pos.y, enemy.width, enemy.height);
           ctx.strokeStyle = '#fff';
           ctx.lineWidth = 2;
           ctx.strokeRect(enemy.pos.x + 4, enemy.pos.y + 4, enemy.width - 8, enemy.height - 8);
        }
      });

      // Draw Bullets
      bulletsRef.current.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.pos.x, bullet.pos.y, bullet.width, bullet.height);
      });

      // Draw Particles
      particlesRef.current.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillRect(p.pos.x, p.pos.y, p.width, p.height);
        ctx.globalAlpha = 1.0;
      });

      // Draw HUD inside canvas for performance? 
      // Actually React Overlay is better for text quality, but let's put score here for instant feedback
      ctx.fillStyle = 'white';
      ctx.font = '20px "Courier New"';
      ctx.fillText(`PONTOS: ${scoreRef.current}`, 20, 30);
      ctx.fillText(`ONDA: ${waveRef.current}`, 20, 60);
    }

  }, [gameState]);

  // Loop Driver
  useEffect(() => {
    const loop = () => {
      update();
      draw();
      
      if (gameState === GameState.PLAYING && !isGameOverRef.current) {
        requestRef.current = requestAnimationFrame(loop);
      }
    };

    if (gameState === GameState.PLAYING) {
      if (frameCountRef.current === 0 || isGameOverRef.current) resetGame();
      requestRef.current = requestAnimationFrame(loop);
    } else {
      // Just draw one frame if paused or menu
      draw();
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, update, draw, resetGame]);

  // Mobile Controls - Touch Handlers
  const handleTouchStart = (direction: 'left' | 'right' | 'shoot') => {
    if (direction === 'left') keysRef.current['ArrowLeft'] = true;
    if (direction === 'right') keysRef.current['ArrowRight'] = true;
    if (direction === 'shoot') keysRef.current[' '] = true;
  };

  const handleTouchEnd = (direction: 'left' | 'right' | 'shoot') => {
    if (direction === 'left') keysRef.current['ArrowLeft'] = false;
    if (direction === 'right') keysRef.current['ArrowRight'] = false;
    if (direction === 'shoot') keysRef.current[' '] = false;
  };

  return (
    <div className="relative w-full h-full flex justify-center items-center bg-gray-900 touch-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full max-w-[800px] max-h-[600px] object-contain shadow-2xl border border-slate-700 bg-slate-900"
      />
      
      {/* Mobile Controls Overlay - Improved for ergonomics */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-between px-6 md:hidden pointer-events-none select-none">
        
        {/* Left Side: Movement D-Pad */}
        <div className="flex gap-4 pointer-events-auto">
          <button 
            className="w-20 h-20 bg-blue-600/30 rounded-full border-2 border-blue-400/50 active:bg-blue-600/80 active:border-blue-400 active:scale-95 transition-all flex items-center justify-center text-white text-3xl font-bold backdrop-blur-sm"
            onTouchStart={(e) => { e.preventDefault(); handleTouchStart('left'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('left'); }}
            onMouseDown={() => handleTouchStart('left')}
            onMouseUp={() => handleTouchEnd('left')}
            aria-label="Mover Esquerda"
          >
            ←
          </button>
          <button 
            className="w-20 h-20 bg-blue-600/30 rounded-full border-2 border-blue-400/50 active:bg-blue-600/80 active:border-blue-400 active:scale-95 transition-all flex items-center justify-center text-white text-3xl font-bold backdrop-blur-sm"
            onTouchStart={(e) => { e.preventDefault(); handleTouchStart('right'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('right'); }}
            onMouseDown={() => handleTouchStart('right')}
            onMouseUp={() => handleTouchEnd('right')}
            aria-label="Mover Direita"
          >
            →
          </button>
        </div>

        {/* Right Side: Action Button */}
        <button 
            className="w-24 h-24 bg-red-600/30 rounded-full border-4 border-red-400/50 active:bg-red-600/80 active:border-red-400 active:scale-95 transition-all flex items-center justify-center text-white font-bold tracking-widest pointer-events-auto backdrop-blur-sm"
            onTouchStart={(e) => { e.preventDefault(); handleTouchStart('shoot'); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('shoot'); }}
            onMouseDown={() => handleTouchStart('shoot')}
            onMouseUp={() => handleTouchEnd('shoot')}
            aria-label="Atirar"
        >
          TIRO
        </button>
      </div>
    </div>
  );
};

export default GameCanvas;