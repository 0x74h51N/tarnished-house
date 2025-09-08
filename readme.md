# Tarnished House

This scene built with Three.js, TypeScript & GLSL. What started as a simple learning scene project has grown into a custom mini game engine with random mesh generation, custom particle effects, optimized lighing systems with cascaded shadows, smooth mobile and desktop controllers, settings ui, and different optimization profiles.



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
│   ├── assets.json     
│   ├── config.json        
│   ├── components               // UI-related DOM elements and interaction handlers
│   │   ├── audio                
│   │   ├── devgui               
│   │   ├── photo
│   │   ├── settings             
│   │   └── ui                 
│   ├── engine                   // Core engine logic and rendering
│   │   ├── 3dui                 // 3D world UI interaction buttons, etc.
│   │   ├── audio                // 3D audio system and sound sources
│   │   ├── camController        // Camera setup and user controls
│   │   │   └── controller       // CamLock and touchscreen nipple controllers
│   │   ├── interaction          // Raycast systems
│   │   ├── lights               // Cascaded shadows and other lights
│   │   ├── particles
│   │   │   ├── flame
│   │   │   └── point
│   │   ├── perfProfiles         // Mobile/low-end PC detection & config switching
│   │   ├── postprocess        
│   │   └── renderer             // Render loop and WebGL renderer
│   ├── loaders
│   │   └── instanced            // Instanced meshes and LOD variants for objects
│   ├── prefabs                  // Reusable scene entities, that package models with behavior and effects
│   │   └── Bonfire
│   ├── style.css
│   ├── main.ts
│   ├── types.ts                
│   └── utils                    // General utilities and helpers
└── tests
```
## TODO
- [x] Increase foliage object counts and optimize with **instancedMesh**  
- [x] Implement sun/moon lighting with cascaded shadows across the map (with optimizations)  
- [ ] Procedural terrain generation: tile-based, slopes, texture sets by height/slope  
- [ ] Add different anti-alising methods (MSAA, FXAA etc.)
- [ ] Make more realistic shadows for CSM
- [ ] Add Ambient Occlusion with SSAO
- [ ] Add a lake or river with a custom water shader  
- [ ] Enhance scene composition and add new foliage assets  
- [ ] Integrate **Rapier** for physics and object colliders  
- [ ] Improve performance profiles and overall optimization  
- [ ] Add a **main character** with basic walk/run animations  
- [ ] Add **enemy NPCs** with animations  
- [ ] Build **NPC AI systems** with **YUKA**  
- [ ] Implement core gameplay mechanics  
- [ ] Implement **combat systems and animations**  
- [ ] Add sounds and FXs

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

- **Fire Start Sound Effect**

  - **Authors:** LookIMadeAThing
  - **Source:** [Freesound - Basic Fire whoosh](https://freesound.org/people/LookIMadeAThing/sounds/260554/)
  - **License:** CC0
