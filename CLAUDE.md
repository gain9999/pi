# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client-side web application featuring two interactive JavaScript canvas games/visualizations:
- **Garden Explorer Game** (`pi-rabbit-game.js`) - A 2D top-down exploration game with realistic garden elements
- **Birthday Scene** (`birthday-scene.js`) - A 3D animated scene using Three.js with coastal landscape and flowers

## Project Structure

```
/
├── index.html              # Main HTML file that loads the garden game
├── pi-rabbit-game.js       # 2D Garden Explorer game engine
├── birthday-scene.js       # 3D Birthday scene (Three.js)
└── .claude/
    └── settings.local.json # Claude Code permissions
```

## Code Architecture

### Garden Explorer Game (`pi-rabbit-game.js`)
- **Main Class**: `Realistic3DGardenGame` - Core game engine
- **Rendering System**: Canvas 2D with pseudo-3D effects using gradients and shadows
- **Game Loop**: Standard update/render cycle with requestAnimationFrame
- **Component Architecture**:
  - Player system with 8-directional movement and sprite animations
  - Camera system with smooth following
  - Collision detection for solid garden elements
  - Particle system for ambient effects
  - Dynamic lighting system with shadow casting

### Birthday Scene (`birthday-scene.js`)
- **Main Class**: `BirthdayScene` - Three.js scene controller
- **3D Rendering**: Full Three.js WebGL pipeline
- **Procedural Generation**: 
  - Dynamic terrain with multiple noise octaves
  - Procedural textures created via canvas
  - Animated ocean with wave displacement
- **Component Systems**:
  - Lighting system with directional and ambient lights
  - Animation system for flowers, ocean, sun, and camera
  - Particle effects and atmospheric rendering

### Shared Patterns
- Both games use canvas-based sprite generation
- Extensive use of gradients and procedural textures for realistic visuals
- Smooth interpolation for animations (`Math.smoothstep` utility)
- Event-driven input handling
- Modular sprite creation methods

## Key Technical Features

### Rendering Techniques
- **Pseudo-3D in 2D**: Uses gradients, shadows, and depth sorting
- **Procedural Textures**: Canvas-generated textures for terrain, water, vegetation
- **Particle Systems**: Ambient particles for atmospheric effects
- **Dynamic Lighting**: Real-time shadow calculation and ambient lighting

### Game Systems
- **Smooth Camera**: Interpolated camera following with world bounds
- **Collision System**: AABB collision detection with solid/non-solid elements
- **Animation System**: Sprite-based character animation with walking cycles
- **Input Handling**: Multi-key input with diagonal movement normalization

### Performance Considerations
- Culling for off-screen particle rendering
- Efficient depth sorting using y-coordinate
- Canvas texture caching and reuse
- Smooth interpolation to reduce jitter

## Development Workflow

### Testing the Application
```bash
# Serve the files locally (no build system required)
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in a web browser.

### Code Modifications
- No build process - direct file editing
- Refresh browser to see changes
- Both games are self-contained in their respective JS files
- HTML file can be modified to switch between games by changing the script src

## Architecture Notes

- Pure vanilla JavaScript with Three.js dependency for the 3D scene
- No module system - everything in global scope
- Canvas-first approach for both 2D and texture generation
- Heavy use of procedural generation for visual variety
- Event-driven architecture with window event listeners