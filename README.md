# Pocket Craft — Xiaomi Smart Band 10 Pro Ceramic

**PocketCraft** is an original, small, offline **isometric voxel survival sandbox** for **Xiaomi Smart Band 10 Pro Ceramic Edition (China Vela firmware)**. All in-game text is English; no Chinese UI. Inspired by the broader voxel-sandbox genre, with original art and code.

## Download
1. Open [GitHub Releases](https://github.com/danilfg/craft-smart-band-10-pro/releases).
2. Download `PocketCraft-Band10Pro.rpk` from the newest **successful** release.
3. Open AstroBox → connect watch → Quick Apps → install the RPK.
4. Open **Pocket Craft** from the watch's apps list. You do **not** need AstroBox open during offline gameplay.

> Do **not** flash a firmware file to play this game. This project builds a Vela Quick App (`.rpk`), not a watch firmware image. Avoid unnecessary Bluetooth unpairing or factory resets. A real-device launch and performance test on Ceramic Edition has **not yet been independently confirmed**.

## Included in v0.1.1
- Procedural deterministic world at arbitrary signed X/Y coordinates; terrain is rendered in a lightweight 5×5 window (no world boundary).
- Four biomes: forest, desert, snow and highland. Height variation, ore distribution, wooden trees, rivers.
- Optimized 2.5D isometric renderer with visible top and side faces, generated block textures, depth-ordered sprites.
- Mining, placing and cycling building blocks; selection cursor points one cell ahead.
- Survival mode: hearts, hunger, hunger depletion on travel, day/night cycle, hostile night mobs, combat and food.
- Creative mode: unlimited building materials, free traversing of water/height differences, no damage or hunger.
- Inventory, recipe crafting: planks, stone pick, sword, bread, torches and bricks.
- One offline local save slot (position, seed, edits, inventory, game mode, health); autosave and manual save.
- Back gesture, pause, continue, explicit **EXIT GAME** button on menu/pause and **EXIT ✕** directly during gameplay.
- No web access, network requests, account or third-party assets.

### Controls
- **Arrows**: walk and face an adjacent block.
- **MINE**: dig one block in front. Coal/iron need a crafted pick in Survival.
- **PLACE**: build one level up using selected material.
- **BUILD** label: tap to cycle hotbar block.
- **BAG**: inventory, EAT, CRAFT; tap material to select it.
- **HIT**: attack the nearest adjacent mob.
- **Ⅱ**: pause, craft, save, return to main menu or exit.
- Swipe right: pause/back. Back button: pause/back/exit as appropriate.

### Technical constraints and roadmap
This is a **playable vertical slice**, not a full 3D game. Because a smartwatch cannot render an unrestricted 3D Minecraft-sized universe, the terrain is generated on demand but displayed in an isometric **2.5D** window. A cell stores a height and a top block type; the game does **not** yet support vertical caves or arbitrary internal 3D block placement. Modifications are bounded to the **160 most recently edited columns** to limit storage and memory use. Offline multiplayer, complex circuits/redstone, autonomous farming, other dimensions, and third-party mods are **not implemented**. The priority is a responsive app on the tiny 336×480 watch display.

Sources: Xiaomi Vela Quick App (UX/JS), no browser engines or external services. Engine: `src/common/world.js`. UI: `src/pages/index/index.ux`. Art: generated with `scripts/generate_assets.py` (Pillow).

## Black-screen fix in v0.1.1

This version addresses the black screen reported on the actual Chinese Smart Band 10 Pro Ceramic:

- World engine is embedded in the page script to avoid runtime resolution issues on older Vela firmware.
- Startup creates **25** voxel images instead of **81**; only every fourth world tick refreshes the scene.
- World is rendered before switching away from the menu, and recoverable errors return to the menu.
- **EXIT ✕** is always visible on the gameplay screen. Swipe right or use the device back gesture to pause, then **MAIN MENU** or **EXIT GAME**.
- Manifest versionCode is incremented to **2** so the updated RPK can replace v0.1.

Download the most recent successful GitHub Actions release and update the existing quick app through AstroBox. If the old build remains black, remove **only the Pocket Craft quick app** and install the new RPK; **do not reset the watch or unpair it from Mi Fitness**. Removing the quick app may delete its local saved game.

The fixes passed logic/UI smoke checks, but full firmware-level rendering still requires verification on the physical device.

## Build

```bash
python3 -m pip install Pillow
npm install
npm run assets
npm run check
npm test
npm run build
```

`npm run build` runs Xiaomi's official `aiot-toolkit@2.0.4`; an RPK appears in `dist/`.

### Automated RPK and release
[GitHub Actions: Build PocketCraft RPK](https://github.com/danilfg/craft-smart-band-10-pro/actions/workflows/release.yml) runs on pushes to `main` and via **Run workflow**. It generates the original textures, checks all required files, runs Node logic tests, builds the actual `.rpk`, uploads it as an Actions artifact and attaches it to a GitHub Release.

**A build may still fail on Xiaomi toolchain/firmware incompatibility.** The workflow does not upload a fake or empty RPK on failure.

## Credits and license
Code and art created for this project. MIT. No Minecraft art, binaries, code or trademarks are included in the game.
