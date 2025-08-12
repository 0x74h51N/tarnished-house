# Tarnished House

Procedural haunted scene built with Three.js, TypeScript & GLSL featuring random mesh generation, optimized assets, custom particle effects, and basic mobile support.

![capture_1754956951170](https://github.com/user-attachments/assets/db83bf29-aa6d-4aec-a2bf-f663a076080d)

## Overview

- **Procedural Generation**  
  Trees, graves, bushes and roots are procedurally placed in random positions when the scene initializes or when the object count is updated (for now).
- **Custom Shaders**  
  Fire, smoke and spark systems plus post-processing (bloom, fog) powered by GLSL.
- **Responsive UI**  
  Real-time controls to scene options as like graphic settings, effects or random mesh counts.
- **Live Project**  
  Under active development, applying new learnings, performance tuning, and maybe pychic engine and playable features.

While the original idea was inspired by the Three.js Journey Haunted House lesson, I built everything else from scratch: random mesh placement, scene composition, asset optimization, particle systems (flame, smoke, sparks), UI design and more. I’ll keep evolving this project as I learn and who knows, it might turn into a small playable browser Souls-like game someday...

## Structure

```
.
├── src
│   ├── assets.json              // Asset options
│   ├── config.json              // Global configuration file
│   ├── components               // UI-related DOM elements and interaction handlers
│   │   ├── audio                // Sound toggle button and UI controls
│   │   ├── devgui               // Developer GUI (debug panels)
│   │   ├── photo
│   │   ├── settings             // Settings panel and user config management
│   │   └── ui                   // General UI elements like loading and intro modals
│   ├── engine                   // Core engine logic and rendering
│   │   ├── 3dui                 // 3d world interaction buttons etc.
│   │   ├── audio                // 3D audio system and sound sources
│   │   ├── camera               // Camera setup and user controls
│   │   ├── lights               // Lighting setup including firelight and ambient
│   │   ├── lowEndProfile        // Mobile and lowEnd pc detech & change onfigs
│   │   ├── particles            // Particle systems flame and point particles (smoke, sparks)
│   │   ├── postprocess          // Post-processing effects like bloom and fog
│   │   └── renderer             // Render loop and WebGL renderer creation
│   ├── loaders                  // Asset loaders for models, textures, and placement (random or static)
│   ├── prefabs                  // Reusable scene entities, that package models with behavior and effects
│   │   └── Bonfire
│   ├── style.css
│   ├── main.ts
│   ├── types.ts                 // Shared TypeScript types
│   └── utils                    // General utilities and helpers

```

## Credits

This project is licensed under GPL-3.0. See [license](./LICENSE).

### Resource Library

- **Branches**

  - **Authors:** Rico Cilliers
  - **Source:** [Poly Haven - Dry Branches Medium 01](https://polyhaven.com/a/dry_branches_medium_01)
  - **License:** CC0

- **Bushes**

  - **Authors:** PlantCatalog
  - **Source:** [Sketchfab - Realistic HD Rosemary willow](https://sketchfab.com/3d-models/realistic-hd-rosemary-willow-9799-83dc6c88f9184ac08d294e9751d8029c)
  - **License:** CC-BY 4.0

- **Gravestones**

  - **Authors:** AO-INTERACTIVE
  - **Source:** [Sketchfab - Grave Stones](https://sketchfab.com/3d-models/grave-stones-743bddbaca8e4a2caabd08c727be51ed)
  - **License:** CC-BY 4.0

- **Trees**

  - **Authors:** DjMaesen
  - **Source:** [Sketchfab - Trees Pack](https://sketchfab.com/3d-models/trees-eed7470843504aa592514554a6100fbc)
  - **License:** CC-BY 4.0

- **Abandoned House**

  - **Authors:** Sengchor & 0x74h51n
  - **Source:** [Sketchfab - Abandoned House](https://sketchfab.com/3d-models/abandoned-house-a0c01ce35a474545b805c0739806aace)
  - **License:** CC-BY 4.0

- **Bonfire**

  - **Authors:** UselessViking
  - **Source:** [Sketchfab - Dark Souls - Bonfire](https://sketchfab.com/3d-models/dark-souls-bonfire-b0d68c8f4cd0487da3d1fb8327ab1044)
  - **License:** CC-BY 4.0

- **Ground Texture**

  - **Authors:** Rob Tuytel
  - **Source:** [Poly Haven - Coast Sand Rocks 02](https://polyhaven.com/a/coast_sand_rocks_02)
  - **License:** CC0

- **Abandoned House Textures**

  - **Authors:** Rob Tuytel
  - **Source:** [Poly Haven - Rough Plaster Brick](https://polyhaven.com/a/rough_plaster_brick)
  - **License:** CC0

- **Abandoned House Textures**

  - **Authors:** Rob Tuytel
  - **Source:** [Poly Haven - Rough Wood](https://polyhaven.com/a/rough_wood)
  - **License:** CC0

- **Abandoned House Textures**

  - **Authors:** Dimitrios Savva & Rob Tuytel
  - **Source:** [Poly Haven - Wood Peeling Paint Weathered](https://polyhaven.com/a/wood_peeling_paint_weathered)
  - **License:** CC0

- **Smoke Sprites**

  - **Authors:** Fupi
  - **Source:** [OpenGameArt - Smoke Vapor Particles](https://opengameart.org/content/smoke-vapor-particles)
  - **License:** CC0

- **Ambiance Sound**

  - **Authors:** dobroide
  - **Source:** [Freesound - 20060706.night.forest02.flac](https://freesound.org/people/dobroide/sounds/20575)
  - **License:** CC-BY 4.0

- **Fire Sound**

  - **Authors:** NoOneIsReal
  - **Source:** [Freesound - The Fireplace 3.wav](https://freesound.org/people/NoOneIsReal/sounds/387128/)
  - **License:** CC0

- **Moon Photo**
  - **Authors:** 0x74h51n (by me!)
  - **Source:** [Github]()
