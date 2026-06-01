import React, { useEffect, useRef, useCallback } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

// Sprite sheet constants
const FRAME_W = 16;
const FRAME_H = 32;
const SCALE = 2;
const DRAW_W = FRAME_W * SCALE;
const DRAW_H = FRAME_H * SCALE;

// Animation
const WALK_FRAME_DURATION = 150; // ms per frame
const WALK_SPEED = 0.75; // px per frame (at scale)
const NUM_CHARACTERS = 6;
const SPACING = DRAW_W + 6;

// Directions → sprite sheet rows
const DIR_DOWN = 0;
const DIR_UP = 1;
const DIR_RIGHT = 2;
const DIR_LEFT = 3; // flipped RIGHT

// Walk cycle: columns 0→1→2→1
const WALK_CYCLE = [0, 1, 2, 1];
const IDLE_FRAME = 1; // standing still frame

interface CharState {
  x: number;
  dir: number;
  state: 'idle' | 'walk';
  frame: number;
  timer: number; // ms until next state change
  frameTimer: number; // ms until next animation frame
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function initCharacter(index: number, canvasWidth: number): CharState {
  const totalWidth = NUM_CHARACTERS * SPACING;
  const startX = (canvasWidth - totalWidth) / 2 + index * SPACING;
  return {
    x: startX,
    dir: DIR_DOWN,
    state: 'idle',
    frame: 0,
    timer: randomBetween(800, 4000 + index * 500),
    frameTimer: 0,
  };
}

function pickNewState(ch: CharState): void {
  const roll = Math.random();
  if (roll < 0.55) {
    // Walk in a direction
    ch.state = 'walk';
    ch.dir = Math.random() < 0.5 ? DIR_LEFT : DIR_RIGHT;
    ch.timer = randomBetween(2000, 5000);
  } else {
    // Stand idle, possibly face a new direction
    ch.state = 'idle';
    ch.dir = [DIR_DOWN, DIR_UP, DIR_LEFT, DIR_RIGHT][Math.floor(Math.random() * 4)];
    ch.timer = randomBetween(2000, 6000);
  }
  ch.frame = 0;
  ch.frameTimer = 0;
}

export default function AnimatedCharacters(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<CharState[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef(0);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const basePaths = Array.from({ length: NUM_CHARACTERS }, (_, i) =>
    useBaseUrl(`/img/char_${i}.png`),
  );

  const canvasWidth = NUM_CHARACTERS * SPACING + DRAW_W * 8;
  const canvasHeight = DRAW_H + 4;

  const drawCharacter = useCallback(
    (ctx: CanvasRenderingContext2D, img: HTMLImageElement, ch: CharState) => {
      const isLeft = ch.dir === DIR_LEFT;
      const sheetRow = isLeft ? DIR_RIGHT : ch.dir;
      const col =
        ch.state === 'walk' ? WALK_CYCLE[ch.frame % WALK_CYCLE.length] : IDLE_FRAME;

      const sx = col * FRAME_W;
      const sy = sheetRow * FRAME_H;

      const px = Math.round(ch.x);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      if (isLeft) {
        ctx.translate(px + DRAW_W, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, sx, sy, FRAME_W, FRAME_H, 0, 2, DRAW_W, DRAW_H);
      } else {
        ctx.drawImage(img, sx, sy, FRAME_W, FRAME_H, px, 2, DRAW_W, DRAW_H);
      }
      ctx.restore();
    },
    [],
  );

  const update = useCallback(
    (dt: number) => {
      const chars = stateRef.current;
      const minX = 4;
      const maxX = canvasWidth - DRAW_W - 4;

      for (const ch of chars) {
        ch.timer -= dt;
        if (ch.timer <= 0) {
          pickNewState(ch);
        }

        if (ch.state === 'walk') {
          const dx = ch.dir === DIR_LEFT ? -WALK_SPEED : WALK_SPEED;
          ch.x += dx * (dt / 16); // normalize to ~60fps

          // Bounce off edges
          if (ch.x < minX) {
            ch.x = minX;
            ch.dir = DIR_RIGHT;
          } else if (ch.x > maxX) {
            ch.x = maxX;
            ch.dir = DIR_LEFT;
          }

          // Advance walk animation
          ch.frameTimer += dt;
          if (ch.frameTimer >= WALK_FRAME_DURATION) {
            ch.frameTimer -= WALK_FRAME_DURATION;
            ch.frame = (ch.frame + 1) % WALK_CYCLE.length;
          }
        }
      }
    },
    [canvasWidth],
  );

  const render = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      const chars = stateRef.current;
      const images = imagesRef.current;

      const drawOrder = [5, 4, 2, 1, 0, 3];
      for (const i of drawOrder) {
        const ch = chars[i];
        const img = images[i];
        if (img) drawCharacter(ctx, img, ch);
      }
    },
    [canvasWidth, canvasHeight, drawCharacter],
  );

  const loop = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dt = lastTimeRef.current ? Math.min(time - lastTimeRef.current, 100) : 16;
      lastTimeRef.current = time;

      update(dt);
      render(ctx);

      animRef.current = requestAnimationFrame(loop);
    },
    [update, render],
  );

  useEffect(() => {
    // Init character states
    stateRef.current = Array.from({ length: NUM_CHARACTERS }, (_, i) =>
      initCharacter(i, canvasWidth),
    );

    // Load images
    imagesRef.current = basePaths.map((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedRef.current++;
        if (loadedRef.current === NUM_CHARACTERS) {
          animRef.current = requestAnimationFrame(loop);
        }
      };
      return img;
    });

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        display: 'block',
        margin: '0 auto',
        imageRendering: 'pixelated',
        filter:
          'drop-shadow(2px 0 0 rgba(255,255,255,0.33)) drop-shadow(-2px 0 0 rgba(255,255,255,0.33)) drop-shadow(0 2px 0 rgba(255,255,255,0.33)) drop-shadow(0 -2px 0 rgba(255,255,255,0.33))',
      }}
    />
  );
}
