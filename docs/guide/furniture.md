# Furniture

Furniture items populate the office — desks, chairs, computers, plants, shelving, and decorations. Each item is defined by a `manifest.json` and one or more PNG sprites in its own folder under `assets/furniture/`.

## Available Items

### Desks

| Item | Dimensions | Footprint | Rotation |
|---|---|---|---|
| Desk | 48×32 px | 3×2 tiles | 2-way (front/side) |
| Small Table | 32×32 px | 2×2 tiles | 2-way (front/side) |
| Table | 48×64 px | 3×4 tiles | None |
| Coffee Table | 32×32 px | 2×2 tiles | None |

All desks have `isDesk: true`, meaning other items with `canPlaceOnSurfaces` can be placed on top of them.

### Chairs

| Item | Dimensions | Footprint | Rotation |
|---|---|---|---|
| Cushioned Chair | 16×16 px | 1×1 tiles | 3-way mirror |
| Wooden Chair | 16×32 px | 1×2 tiles | 3-way mirror |
| Sofa | 32×16 px | 2×1 tiles | 3-way mirror |
| Cushioned Bench | 16×16 px | 1×1 tiles | None |
| Wooden Bench | 16×16 px | 1×1 tiles | None |

Chairs generate **seat positions** used by agents. Each non-background tile in a chair's footprint becomes a seat, with the facing direction determined by the chair's orientation or an adjacent desk.

### Electronics

| Item | Dimensions | Footprint | Features |
|---|---|---|---|
| PC | 16×32 px | 1×2 tiles | 3-way mirror, on/off state, 3-frame animation |

The PC is the most complex asset — it combines rotation, state toggling (on/off), and animation. When an agent sits at a desk facing a PC, it automatically switches to the "on" state.

### Decor & Plants

| Item | Dimensions | Footprint | Notes |
|---|---|---|---|
| Plant | 16×32 px | 1×2 tiles | 1 background tile |
| Plant 2 | 16×32 px | 1×2 tiles | 1 background tile |
| Large Plant | 32×48 px | 2×3 tiles | 2 background tiles |
| Cactus | 16×32 px | 1×2 tiles | 1 background tile |
| Pot | 16×16 px | 1×1 tiles | — |
| Coffee | 16×16 px | 1×1 tiles | Can place on surfaces |

### Wall Items

| Item | Dimensions | Footprint | Notes |
|---|---|---|---|
| Bookshelf | 32×16 px | 2×1 tiles | — |
| Double Bookshelf | 32×32 px | 2×2 tiles | — |
| Whiteboard | 32×32 px | 2×2 tiles | — |
| Large Painting | 32×32 px | 2×2 tiles | — |
| Small Painting | 16×32 px | 1×2 tiles | — |
| Small Painting 2 | 16×32 px | 1×2 tiles | — |
| Clock | 16×32 px | 1×2 tiles | — |
| Hanging Plant | 16×32 px | 1×2 tiles | Can place on walls and surfaces |

### Misc

| Item | Dimensions | Footprint |
|---|---|---|
| Bin | 16×16 px | 1×1 tiles |

## Manifest Format

Each furniture item has a `manifest.json` in its folder. There are two main types:

### Simple Asset

```json
{
  "id": "BIN",
  "name": "Bin",
  "category": "misc",
  "type": "asset",
  "file": "BIN.png",
  "width": 16,
  "height": 16,
  "footprintW": 1,
  "footprintH": 1,
  "canPlaceOnWalls": false,
  "canPlaceOnSurfaces": false,
  "backgroundTiles": 0
}
```

### Grouped Asset (Rotation + State + Animation)

Groups nest to compose complex behaviors:

```json
{
  "id": "PC",
  "name": "PC",
  "category": "electronics",
  "type": "group",
  "groupType": "rotation",
  "rotationScheme": "3-way-mirror",
  "canPlaceOnSurfaces": true,
  "backgroundTiles": 1,
  "members": [
    {
      "type": "group",
      "groupType": "state",
      "orientation": "front",
      "members": [
        {
          "type": "group",
          "groupType": "animation",
          "state": "on",
          "members": [
            { "type": "asset", "id": "PC_FRONT_ON_1", "file": "PC_FRONT_ON_1.png", "frame": 0, ... },
            { "type": "asset", "id": "PC_FRONT_ON_2", "file": "PC_FRONT_ON_2.png", "frame": 1, ... },
            { "type": "asset", "id": "PC_FRONT_ON_3", "file": "PC_FRONT_ON_3.png", "frame": 2, ... }
          ]
        },
        { "type": "asset", "id": "PC_FRONT_OFF", "file": "PC_FRONT_OFF.png", "state": "off", ... }
      ]
    }
  ]
}
```

## Manifest Properties

### Core Properties

| Property | Type | Description |
|---|---|---|
| `id` | string | Unique asset identifier |
| `name` | string | Display name |
| `category` | string | One of: `desks`, `chairs`, `storage`, `electronics`, `decor`, `wall`, `misc` |
| `type` | string | `"asset"` for a leaf sprite, `"group"` for a container |
| `file` | string | PNG filename (leaf assets only) |
| `width` / `height` | number | Sprite dimensions in pixels |
| `footprintW` / `footprintH` | number | Grid footprint in tiles |

### Placement Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `canPlaceOnWalls` | boolean | false | Can be placed on wall tiles |
| `canPlaceOnSurfaces` | boolean | false | Can sit on top of desks/tables |
| `backgroundTiles` | number | 0 | Rows from the top that don't block walking |

### Group Properties

| Property | Type | Description |
|---|---|---|
| `groupType` | string | `"rotation"`, `"state"`, or `"animation"` |
| `rotationScheme` | string | `"2-way"`, `"3-way-mirror"`, or 4-way (default) |
| `orientation` | string | `"front"`, `"back"`, `"left"`, `"right"`, `"side"` |
| `state` | string | `"on"` or `"off"` |
| `frame` | number | Animation frame index (0-based) |
| `mirrorSide` | boolean | If true, the side orientation generates a virtual left variant by flipping |

## Rotation Schemes

| Scheme | Orientations | Use Case |
|---|---|---|
| 2-way | Front + side | Symmetric furniture (desks, tables) |
| 3-way-mirror | Front + back + side (side mirrors to left) | Chairs, PCs, sofas |
| 4-way (default) | Front + back + left + right | — |

## Background Tiles

The `backgroundTiles` property controls how many rows from the **top** of the sprite allow characters to walk through. This creates the illusion of depth — for example, a tall plant's canopy extends above the character while the pot blocks the tile.

```
backgroundTiles: 2    →  top 2 rows are walkable
                          bottom rows block movement
```

## Z-Sorting

Furniture depth is determined by the `zY` coordinate (bottom edge Y position):

- **Default**: `zY = y + spriteHeight`
- **Chairs**: Special handling so seated characters overlap correctly
- **Surface items**: Rendered slightly in front of the desk they sit on (`zY = deskZ + 0.5`)

## Furniture Catalog

At runtime, manifests are flattened into a catalog that manages rotation groups, state toggles, and animation sequences. The catalog exposes:

```typescript
getCatalogEntry(type)              // Full entry with all variants
getCatalogByCategory(category)     // Filter by category
getRotatedType(type, direction)    // Next rotation variant (CW/CCW)
getToggledType(type)               // On ↔ off state
getAnimationFrames(type)           // Ordered frame IDs
```

The editor palette shows only the "default" variant of each item (front orientation, off state, first animation frame).

## Adding Custom Furniture

1. Create a folder in `webview-ui/public/assets/furniture/` with your PNG sprite(s)
2. Add a `manifest.json` describing the item (see format above)
3. Rebuild the extension

The **asset manager** (`scripts/asset-manager.html`) provides a visual editor for creating and editing manifests.

## Key Files

| File | Purpose |
|---|---|
| `src/assetLoader.ts` | Extension-side asset loading and PNG decoding |
| `shared/assets/manifestUtils.ts` | Manifest flattening (nested groups → flat array) |
| `shared/assets/pngDecoder.ts` | PNG → SpriteData conversion |
| `webview-ui/src/office/layout/furnitureCatalog.ts` | Runtime catalog with rotation/state/animation |
| `webview-ui/src/office/layout/layoutSerializer.ts` | Grid placement → renderable instances |
| `webview-ui/src/office/types.ts` | `PlacedFurniture`, `FurnitureInstance` types |
