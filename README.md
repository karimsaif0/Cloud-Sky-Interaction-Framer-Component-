# ☁️ Cloud Sky — Interactive Framer Component

A procedural WebGL cloudscape built for Framer.

Cloud Sky generates layered clouds in real time with soft atmospheric shading, cirrus detail, sun glow, flowing motion, and pointer-driven parallax. No videos, no image sequences, and no external rendering library — the scene is generated directly in WebGL.

## Live Preview

**[View the live Framer demo](https://cloudsky.framer.website/)**

## Highlights

- Procedural WebGL cloud generation
- Layered near and distant cloud formations
- High-altitude cirrus detail
- Atmospheric sun glow
- Pointer-driven parallax
- Pointer-reactive wind
- Adjustable cloud density, size, softness, and shadow
- Custom sky, horizon, cloud, and glow colors
- Responsive sizing for Framer layouts
- High-DPI rendering with DPR limiting
- Adaptive pixel budget for large displays
- Reduced-motion support
- Framer static-renderer support
- Automatic off-screen animation pausing
- ResizeObserver support
- WebGL context restoration
- RAF and GPU resource cleanup
- Framer property controls with descriptions

## Customize in Framer

Everything is controlled from the Framer property panel.

### Colors

- **Sky** — upper sky color
- **Horizon** — lower atmospheric color
- **Clouds** — primary cloud color

### Cloud Details

- **Density** — amount of cloud coverage
- **Size** — overall cloud scale
- **Softness** — cloud edge diffusion
- **Shadow** — depth and internal shading
- **Cirrus** — thin high-altitude cloud detail

### Sun

- **X** — horizontal glow position
- **Y** — vertical glow position
- **Glow** — atmospheric glow color and opacity

### Pointer

- **Parallax** — pointer-driven cloud displacement
- **Wind** — pointer influence on cloud movement
- **Damping** — smoothing and settling response

## Performance

Cloud Sky includes several safeguards for production Framer projects:

- DPR capped at 2
- Adaptive render resolution
- GPU pixel budget
- Animation paused when off-screen
- Reduced-motion handling
- Static/export rendering
- WebGL context recovery
- Resource and animation cleanup on unmount

## Installation

1. Open your Framer project.
2. Create a new Code Component.
3. Copy the contents of `KarimSaifCloudSky.tsx`.
4. Paste the code into Framer.
5. Add **Karim Saif — Cloud Sky** to your canvas.
6. Customize the component from the Framer property panel.

## Source

The complete Framer component is available here:

**[KarimSaifCloudSky.tsx](./KarimSaifCloudSky.tsx)**

## Links

- **Live Preview:** https://cloudsky.framer.website/
- **GitHub:** https://github.com/karimsaif0/Cloud-Sky-Interaction-Framer-Component-
- **X:** https://x.com/karimsaif0
- **Email:** karimsaif010@gmail.com

## Support

If you have a question, find an issue, or want to share something you built with Cloud Sky, reach out:

**X:** [@karimsaif0](https://x.com/karimsaif0)  
**Email:** karimsaif010@gmail.com

---

Made with 💛 by **Karim Saif**  
Created and customized for Framer by **Karim Saif**
