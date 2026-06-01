---
sidebar_position: 5
---

# Floors

Floor tiles are **16×16 pixel** grayscale patterns that are colorized at runtime using HSL transformations. This allows a small set of patterns to produce a wide range of floor appearances.

## Tile Types

The `TileType` enum defines all tile states:

| Value | Name | Description |
|---|---|---|
| 0 | `WALL` | Not a floor — renders as a wall |
| 1–9 | `FLOOR_1` – `FLOOR_9` | Floor patterns |
| 255 | `VOID` | Transparent / empty |

Nine floor patterns are available, stored as numbered PNGs:

```
webview-ui/public/assets/floors/
  floor_0.png    # solid gray (fallback)
  floor_1.png    # through floor_8.png — distinct patterns
```

## Colorization

Floors use a **Photoshop-style colorize** mode to transform grayscale patterns into colored tiles:

1. Read the perceived luminance from the grayscale pixel: `0.299×R + 0.587×G + 0.114×B`
2. Apply contrast: `lightness = 0.5 + (lightness - 0.5) × (100 + c) / 100`
3. Apply brightness: `lightness = lightness + b / 200`
4. Convert to HSL using the user's hue and saturation values
5. Output the recolored pixel

Each tile in the layout stores its own `FloorColor`:

```typescript
interface FloorColor {
  h: number   // Hue: 0–360
  s: number   // Saturation: 0–100
  b: number   // Brightness: -100 to +100
  c: number   // Contrast: -100 to +100
}
```

Colorized sprites are cached by key: `floor-{patternIndex}-{h}-{s}-{b}-{c}`.

## Rendering

Floor tiles are rendered as part of `renderTileGrid()` before furniture and characters. Each floor tile is:

1. Looked up by its `TileType` → pattern index
2. Colorized with the tile's `FloorColor`
3. Drawn at `(col × TILE_SIZE, row × TILE_SIZE)`

`VOID` tiles are skipped (transparent), and `WALL` tiles are handled by the wall rendering system instead.

## Key Files

| File | Purpose |
|---|---|
| `webview-ui/src/office/floorTiles.ts` | Floor pattern storage, colorized sprite caching |
| `webview-ui/src/office/colorize.ts` | HSL colorization engine (colorize + adjust modes) |
| `shared/assets/pngDecoder.ts` | `decodeFloorPng()` — PNG buffer to SpriteData |
| `webview-ui/src/office/engine/renderer.ts` | `renderTileGrid()` — floor and wall rendering |
