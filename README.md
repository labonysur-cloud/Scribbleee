# 👑🎀 Scribbleee — The Whimsical Neo-Brutalist Font Studio 🖤✨

<div align="center">

```
  ____            _ _     _     _                   
 / ___| -_ _-_ _ |_|_|___| |___| | ___  ___  ___  
 \___ \ / -_| '_|| | | . | | -_| |/ -_)/ -_)/ -_) 
  ___) | |  | |  | | |___|_|___|_|\___|\___|\___| 
 |____/|_|  |_|  |_|_|                            
```

**Where Sharp Neo-Brutalism Meets Princess-Cute Aesthetic! 👑✨**  
*Create, animate, and download custom English & Bangla fonts right in your browser — zero login, zero database, 100% pure client-side magic.*

---

</div>

## 🌟 What is Scribbleee?

**Scribbleee** is a next-generation, zero-backend, browser-based custom typography studio and font foundry. Designed with a striking **Neo-Brutalist** monochrome foundation paired with playful **Princess-Cute** pastel accents, Scribbleee empowers designers, creators, and aesthetic enthusiasts to draw, refine, and export real installable fonts in seconds.

Whether you want to build custom whimsical headers for your website, create animated 12 FPS stop-motion typography for **Instagram Stories**, or publish bilingual **Bangla & English** handwriting fonts to an open community library, Scribbleee handles everything directly inside your browser memory!

---

## ✨ Features That Make It Viral-Worthy

### 🖤 Exactly Zero Databases Needed (Serverless & Decentralized Friendly)
Scribbleee is architected to run with zero server-side database dependencies:
- **Local Client Foundry**: Draft projects, stroke buffers, and SVG paths are persisted instantly in browser storage with sub-millisecond serialization.
- **Git-as-a-Backend Ready**: Built to natively integrate with public GitHub repository JSON archives or decentralized **IPFS** networks (Pinata / Web3.Storage) for peer-to-peer community font sharing without hosting costs or admin friction.

### 🎨 3 Built-In Algorithmic Font Templates
Never stare at a blank canvas! Load complete mathematical arc-based stroke definitions into any letter or **Bulk Apply** across your entire project:
1. 🎀 **Dainty Script**: Delicate, flowing cursive aesthetic loops.
2. 🪨 **Bold Chunky**: Thick, punchy Neo-Brutalist bubble characters.
3. ✏️ **Sketchy Doodle**: Energetic, multi-pass notebook doodle vibes.

### 🌐 Bilingual Unicode Support (English & Bangla)
Design without boundaries! Scribbleee includes full glyph maps and grid navigation for:
- **English Standard**: `A-Z`, `a-z`, `0-9`
- **Full Bangla Script**: `ক–ঁ`, `অ–ঔ`, `০–৯` along with native vowel marks and conjunct compatibility.

### ⚡ Pure Client-Side 4-Format Universal Export Engine
Harnessing the power of `opentype.js` and custom binary wrappers, Scribbleee compiles raw canvas points into fully valid font files in real-time:
| Format | Extension | Ideal Use Case |
| :--- | :---: | :--- |
| **TrueType Font** | `.ttf` | Universal installation across macOS (Font Book), Windows, Linux, & iOS/Android apps |
| **OpenType Font** | `.otf` | Advanced typographic features for Adobe Illustrator, Photoshop, Figma, & Procreate |
| **Web Font** | `.woff` | Native web application embedding via CSS `@font-face` |
| **Compressed Web Font** | `.woff2` | High-performance, lightweight modern website deployments |

### 🎬 12 FPS Stop-Motion Typographic Animation Engine
Experience pure-code motion design! Scribbleee features a hardcoded 5-variant structural animation system that loops individual letterforms independently at a snappy **12 FPS flipbook pace**—creating an authentic stop-motion doodle aesthetic without needing GIF or video assets.

### 📱 Live Type Tester & Instagram Story Specimen Generator
- **Live `@font-face` Injection**: Test your font immediately as you draw. Your strokes are dynamically wrapped into an in-memory blob URL and injected into CSS so you can type real sample paragraphs.
- **Specimen PNG & Story Video Export**: Download high-resolution PNG type specimens or export 1080x1920 WebM videos tailored specifically for **Instagram Stories** and Reels!

---

## 🏗 Technical Architecture

```
[ User Drawing Canvas ] (Perfect-Freehand Splines)
         │
         ▼
[ Stroke Normalizer ]   ──>   [ SVG Path Converter ] (Cubic Bézier Approximation)
                                       │
                                       ▼
                              [ opentype.js Engine ]
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
   [ TTF / OTF ArrayBuffer ]     [ WOFF1 Binary Wrapper ]     [ Base64 CSS DataURL ]
         │                             │                             │
         ▼                             ▼                             ▼
 [ Desktop Font Download ]     [ Web Deployment File ]      [ Live @font-face Inject ]
```

### Key Technical Highlights
- **Smooth Stroke Splines**: Uses `perfect-freehand` algorithm to generate pressure-sensitive, beautifully tapered outline contours from mouse, trackpad, or Apple Pencil inputs.
- **SVG Path Engineering**: Converts canvas point arrays into optimized SVG `M`, `C`, `Q`, `L`, and `Z` path commands properly scaled to standard **1000 UPM (Units Per Em)** typography bounding boxes.
- **Uncompressed WOFF Binary Wrapping**: Implements compliant WOFF table directory structures directly in client-side JavaScript, enabling lightweight web font creation without requiring WebAssembly compression binaries.

---

## 🚀 Quick Start Guide

Run Scribbleee locally on your machine in under 30 seconds:

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/labonysur-cloud/Scribbleee.git
   cd Scribbleee
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**  
   Navigate to `http://localhost:5173` and start crafting your cute custom typography!

---

## 💅 Design Tokens & Aesthetic System

Scribbleee strictly enforces a high-contrast Neo-Brutalist palette softened with Princess-Cute accents:

```css
:root {
  /* Core Monochrome Brutalism */
  --black: #0d0d0d;
  --white: #ffffff;
  --cream: #fbf9f5;
  --cream-dark: #f3efe6;

  /* Whimsical Princess Palette */
  --accent-pink: #ff85a1;
  --accent-rose: #ffb3c6;
  --accent-purple: #c5a3ff;
  --accent-yellow: #fde047;

  /* Sharp Hard Shadows & Borders */
  --border: 2.5px solid var(--black);
  --shadow: 4px 4px 0px var(--black);
}
```

---

## 🤝 Contributing & Community

We believe typography should be fun, accessible, and whimsical for everyone! Whether you want to add new font templates, optimize Bezier curve smoothing, or expand character sets:
1. Fork the repo!
2. Create your feature branch (`git checkout -b feature/cute-new-template`)
3. Commit your changes (`git commit -m 'Add cute new font template'`)
4. Push to the branch (`git push origin feature/cute-new-template`)
5. Open a Pull Request!

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information. Crafted with love, doodles, and sharp borders! 👑✨🖤
