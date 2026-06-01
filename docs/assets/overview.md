---
sidebar_position: 1
---

# Assets

All visual assets in Pixel Agents are fully open-source and included in the repository under `webview-ui/public/assets/`. The asset system covers four categories:

- **[Characters](./characters)** — Agent avatars with walk, typing, and reading animations
- **[Furniture](./furniture)** — Desks, chairs, electronics, decor, and more
- **[Walls](./walls)** — Auto-tiling wall pieces with bitmask-based variant selection
- **[Floors](./floors)** — Grayscale pattern tiles with HSL colorization

## Asset Loading Pipeline

Assets are loaded by the extension host from disk, decoded into `SpriteData` (2D arrays of hex color strings), and sent to the webview via messages. The load order is:

1. Character sprites (`characterSpritesLoaded`)
2. Floor tiles (`floorTilesLoaded`)
3. Wall tiles (`wallTilesLoaded`)
4. Furniture assets (`furnitureAssetsLoaded`)
5. Layout data (`layoutLoaded`)

Each asset type has its own decoder in `shared/assets/pngDecoder.ts` that converts raw PNG buffers into the common `SpriteData` format:

```typescript
type SpriteData = string[][]  // [row][col] of hex color strings
// '' = transparent
// '#RRGGBB' = opaque
// '#RRGGBBAA' = semi-transparent
```

## Sprite Rendering

All sprites are rendered to cached `HTMLCanvasElement` instances per zoom level, with `imageSmoothingEnabled = false` for pixel-perfect scaling. A depth-sorting system (`zY` coordinate) ensures correct overlap between furniture, walls, and characters.

## Colorization

Both walls and floors support HSL colorization via a Photoshop-style colorize mode:

```typescript
interface FloorColor {
  h: number   // Hue: 0–360
  s: number   // Saturation: 0–100
  b: number   // Brightness: -100 to +100
  c: number   // Contrast: -100 to +100
  colorize?: boolean
}
```

Colorized sprites are cached by a composite key to avoid redundant computation.

## External Asset Directories

You can load additional assets from external directories without modifying the built-in ones:

1. Open **Settings** in the Pixel Agents panel
2. Click **Add Asset Directory**
3. Select the folder containing your custom assets

This supports third-party furniture packs and custom asset collections.
