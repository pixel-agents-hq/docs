# Characters

Character sprites represent the AI agents in the office. Each character has walk, typing, and reading animations across four directions.

## Sprite Format

Each character is a single **112×96 pixel** PNG containing a grid of frames:

- **3 rows** — one per direction (down, up, right; left is mirrored from right)
- **7 columns** — animation frames

| Frame Index | Purpose |
|---|---|
| 0 | Walk frame 1 |
| 1 | Idle / standing |
| 2 | Walk frame 2 |
| 3–4 | Typing animation (2-frame blink) |
| 5–6 | Reading animation (2-frame blink) |

Individual frame size: **16×32 pixels**.

## Palettes

There are **6 pre-colored character palettes** (`char_0.png` through `char_5.png`) in `assets/characters/`. Each agent is assigned a palette, and an optional **hue shift** (0–360°) can be applied for further variation.

## Animation States

```typescript
interface CharacterSprites {
  walk: Record<Direction, [SpriteData, SpriteData, SpriteData, SpriteData]>
  typing: Record<Direction, [SpriteData, SpriteData]>
  reading: Record<Direction, [SpriteData, SpriteData]>
}
```

| State | Frames | Duration per Frame | Trigger |
|---|---|---|---|
| Walk | 4 | 0.15s (600ms loop) | Agent moving between tiles |
| Typing | 2 | 0.3s (600ms loop) | Agent using a tool (non-reading) |
| Reading | 2 | 0.3s (600ms loop) | Agent using Read, Grep, Glob, WebFetch, or WebSearch |
| Idle | 1 | — | Agent stationary |

Walk speed is **48 px/sec** (3 tiles/sec at `TILE_SIZE = 16`).

## Direction Handling

Four directions are supported: `DOWN (0)`, `LEFT (1)`, `RIGHT (2)`, `UP (3)`.

The LEFT direction is generated at runtime by horizontally flipping the RIGHT sprites — no separate LEFT row exists in the PNG.

## Key Files

| File | Purpose |
|---|---|
| `webview-ui/src/office/sprites/spriteData.ts` | Sprite template loading, palette hue shifts, frame extraction |
| `webview-ui/src/office/sprites/spriteCache.ts` | Zoom-level canvas caching and outline generation |
| `shared/assets/pngDecoder.ts` | `decodeCharacterPng()` — PNG buffer to direction sprites |
| `webview-ui/src/office/engine/characters.ts` | Character state machine, animation selection |
