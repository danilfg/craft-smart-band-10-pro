# Pocket Craft — Xiaomi Smart Band 10 Pro Ceramic

**PocketCraft** is an original, small, offline **isometric voxel survival sandbox** for **Xiaomi Smart Band 10 Pro Ceramic Edition (China Vela firmware)**. All in-game text is English; no Chinese UI. Inspired by the broader voxel-sandbox genre, with original art and code.

## Download
1. Open [GitHub Releases](https://github.com/danilfg/craft-smart-band-10-pro/releases).
2. Download `PocketCraft-Band10Pro.rpk` from the newest **successful** release.
3. Open AstroBox → connect watch → Quick Apps → install the RPK.
4. Open **Pocket Craft** from the watch's apps list. You do **not** need AstroBox open during offline gameplay.

> Do **not** flash a firmware file to play this game. This project builds a Vela Quick App (`.rpk`), not a watch firmware image. Avoid unnecessary Bluetooth unpairing or factory resets. A real-device launch and performance test on Ceramic Edition has **not yet been independently confirmed**.

## Included in v0.2.0 Lite
- Procedural deterministic world at arbitrary signed X/Y coordinates; terrain is rendered in a lightweight 3×3 window (no world boundary).
- Four biomes: forest, desert, snow and highland. Height variation, ore distribution, wooden trees, rivers.
- Memory-constrained 2.5D isometric renderer with exactly nine fixed sprite nodes, generated block textures and depth ordering.
- Mining, placing and cycling building blocks; selection cursor points one cell ahead.
- Survival mode: hearts, hunger, hunger depletion on travel, day/night cycle, hostile night mobs, combat and food.
- Creative mode: unlimited building materials, free traversing of water/height differences, no damage or hunger.
- Inventory, recipe crafting: planks, stone pick, sword, bread, torches and bricks.
- One offline local save slot (position, seed, edits, inventory, game mode, health); autosave and manual save.
- Back gesture, pause, continue, explicit **EXIT GAME** button on menu/pause and **EXIT** directly during gameplay.
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

## Black-screen fix in v0.2.0

The earlier builds displayed a black screen after entering the game. The actual cause has not been verified using logs from the user's band. This edition is a smaller, safer implementation designed for the limited resources of the BES2700IMP.

Hardware verified from Xiaomi Ceramic FAQ: **BES2700IMP**, **32 MB RAM**, **512 MB ROM**, **1.74-inch AMOLED**, portrait display **336 x 480**. Native development research reports Cortex-M33 and the NuttX / Vela / QuickJS stack.

- Exactly **9 fixed voxel images** instead of 81 originally (then 25). No loop-generated UI tree for the world.
- All voxel PNGs are normalized to **64 x 105 pixels**, so the image component has fixed dimensions.
- World initialization occurs after the small **PREPARING WORLD...** screen can render.
- The menu does not preload the entire world or run the animation timer.
- World visuals update at most every fourth 1.8-second tick; HUD updates can be more frequent.
- Game saves are batched (every eight actions, periodically and on exit) instead of synchronously after each move.
- An **EXIT** button is visible while playing; pause/back/menu and app termination are always available.
- A failure while initializing or rendering returns to the menu with an error label rather than leaving a half-initialized game.
- Manifest versionCode is **3**, so AstroBox can replace an older installed version.

Install the latest **successful** GitHub Actions release. If it does not replace the older version, remove **only the Pocket Craft application** and install the newer RPK (this may erase the local game save). **Do not unpair Mi Fitness or factory-reset your band.**

If even this minimal edition is black, please report whether the black screen happens before the menu, while **PREPARING WORLD...**, or after entering the world: those symptoms indicate different faults. Runtime compatibility on the actual device is still not confirmed.

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
