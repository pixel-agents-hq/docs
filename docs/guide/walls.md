# Walls

Walls use an **auto-tiling** system with bitmask-based sprite selection. Each wall tile inspects its four cardinal neighbors and selects one of 16 sprite variants to create seamless connections.

## Sprite Format

Each wall tileset is a **64×128 pixel** PNG containing a **4×4 grid** of 16×32 pixel pieces — one for each bitmask combination.

```
assets/walls/wall_0.png   →   64×128   →   4 cols × 4 rows = 16 pieces
```

Individual wall piece: **16×32 pixels** (taller than a floor tile to give walls height).

## Bitmask System

Each wall tile checks its four neighbors and builds a 4-bit mask:

| Neighbor | Bit | Value |
|---|---|---|
| North | 0 | 1 |
| East | 1 | 2 |
| South | 2 | 4 |
| West | 3 | 8 |

The mask (0–15) selects the sprite variant from the tileset:

```
col = mask % 4
row = Math.floor(mask / 4)
```

For example, a wall with neighbors to the North and East has mask `1 + 2 = 3`, selecting the piece at column 3, row 0.

## Rendering

Wall pieces are anchored at the **bottom of the tile** — the tall 16×32 sprite extends upward from the 16×16 tile, giving walls visual height. The Y offset is calculated as:

```typescript
yOffset = TILE_SIZE - spriteHeight  // 16 - 32 = -16
```

Walls participate in the same z-sorting system as furniture and characters, with `zY = (row + 1) * TILE_SIZE`.

## Colorization

Walls support per-tile colorization using the same HSL system as floors. The base wall color is `#3A3A5C` (dark blue-gray). When a custom color is applied, the grayscale values in the wall sprite are remapped through the HSL colorization pipeline.

## Key Functions

| Function | File | Purpose |
|---|---|---|
| `buildWallMask(col, row, tileMap)` | `wallTiles.ts` | Scan 4 neighbors, return 4-bit mask |
| `getWallSprite(col, row, tileMap, setIndex)` | `wallTiles.ts` | Get sprite + Y offset for a wall tile |
| `getColorizedWallSprite(...)` | `wallTiles.ts` | Get colorized variant |
| `getWallInstances()` | `wallTiles.ts` | Build FurnitureInstance array for z-sorting |
| `parseWallPng(buffer)` | `pngDecoder.ts` | Decode PNG into 16 SpriteData entries |

## Asset Files

Wall tilesets are stored as numbered PNGs:

```
webview-ui/public/assets/walls/
  wall_0.png    # 64×128 — 16 auto-tile variants
  wall_1.png    # additional wall styles (if present)
```
