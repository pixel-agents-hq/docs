# Office Assets

All office assets (furniture, floors, walls) are fully open-source and included in the repository under `webview-ui/public/assets/`.

## Structure

Each furniture item lives in its own folder under `assets/furniture/` with a `manifest.json` that declares:

- Sprites
- Rotation groups
- State groups (on/off)
- Animation frames

Floor tiles are individual PNGs in `assets/floors/`, and wall tile sets are in `assets/walls/`.

## Adding Custom Furniture

To add a new furniture item:

1. Create a folder in `webview-ui/public/assets/furniture/` with your PNG sprite(s)
2. Add a `manifest.json` describing the item
3. Rebuild the extension

The **asset manager** (`scripts/asset-manager.html`) provides a visual editor for creating and editing manifests.

## External Asset Directories

To load furniture from an external directory:

1. Open **Settings** in the Pixel Agents panel
2. Click **Add Asset Directory**
3. Select the folder containing your custom assets

This allows you to use third-party furniture packs without modifying the extension's built-in assets.
