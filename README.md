<p align="center">
  <img src="images/icon.png" alt="Auto Image Path Updater Logo" width="128" height="128" />
</p>

<h1 align="center">Auto Image Path Updater</h1>

<p align="center">
  <strong>Instantly keep image paths synchronized across your entire codebase in VS Code.</strong><br>
  Move or relocate images anywhere in your workspace and watch references in HTML, CSS, JavaScript, TypeScript, Markdown, and JSON update automatically with zero broken links.
</p>

<p align="center">
  <a href="https://razorpay.me/@lonealpha">
    <img src="https://img.shields.io/badge/Donate-Razorpay-0C2340?style=for-the-badge&logo=razorpay&logoColor=white" alt="Donate via Razorpay" />
  </a>
  <a href="https://buymeacoffee.com/deepakkn">
    <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee" />
  </a>
  <a href="https://github.com/sponsors/DeepakCSGO23">
    <img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="Sponsor on GitHub" />
  </a>
</p>

<p align="center">
  <a href="#why-auto-image-path-updater">Why Auto Image Path Updater?</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#supported-languages--formats">Supported Formats</a> •
  <a href="#usage--examples">Usage & Examples</a> •
  <a href="#under-the-hood-deep-dive">Under the Hood</a> •
  <a href="#support--donate">Donate</a>
</p>

---

## Why Auto Image Path Updater?

Refactoring asset directories or reorganizing media files in modern web projects is fraught with friction:

- Dragging an image from `src/images/` to `public/assets/`.
- Tracking down every broken `<img>`, `background-image: url(...)`, `import`, or Markdown link.
- Performing messy global search-and-replace queries (`Ctrl+Shift+F`) across dozens of files.
- Accidentally breaking paths when multiple folders contain similarly named images (e.g. `icon.png`, `avatar.jpg`).
- Dealing with subtle 404 image errors in production.

**Auto Image Path Updater eliminates this friction completely.** It monitors image movements across your project in real time, intelligently resolves the new relative or root-relative paths, and executes atomic, multi-file edits across your entire codebase before you even switch tabs.

---

## Key Features

- **Zero Configuration**: Works automatically out-of-the-box as soon as you open any workspace folder. No settings, manual triggers, or CLI commands needed.
- **Robust Bidirectional Move Detection**: OS file systems fire event pairs in unpredictable order (`create -> delete` vs `delete -> create`). An intelligent event-parking queue accurately pairs these events across Windows, macOS, and Linux.
- **Polyglot Syntax & Document Coverage**:
  - **HTML**: `src`, `href`, and `srcset` attributes.
  - **CSS & SCSS**: `url(...)` declarations (single quotes, double quotes, and unquoted values).
  - **JavaScript & TypeScript** (`.js`, `.jsx`, `.ts`, `.tsx`): Static `import ... from` and dynamic `import(...)` declarations.
  - **Markdown** (`.md`): Standard `![alt text](path)` syntax.
  - **JSON** (`.json`): Image references in config and mock data.
- **Universal Image Format Support**: Detects moves across **10 image formats**:
  `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.ico`, `.avif`, `.bmp`, and `.tiff`.
- **Intelligent Dual-Path Resolution**:
  - **Relative Paths**: Dynamically recalculates accurate relative paths (`./` and `../`) based on each referencing file's directory.
  - **Web-Root-Relative Paths**: In modern frameworks (Next.js, Vite, React, Nuxt), public assets often use leading-slash paths like `/illustrations/hero.webp`. The extension infers the web-root boundary and preserves root-relative URLs.
  - **External URL Protection**: Automatically skips external resources (`https://`, `http://`, `data:`).
- **Collision-Proof Verification**: Resolves the exact absolute filesystem path before applying any replacement, guaranteeing that files sharing identical filenames in different directories are never mistakenly overwritten.
- **Format & Quote Style Preservation**: Faithfully preserves your project's code style, retaining original single quotes, double quotes, or unquoted CSS syntax.
- **Native Atomic Edits**: Bundles all document modifications into a single `vscode.WorkspaceEdit` transaction, ensuring all changes are safe and fully undoable (<kbd>Ctrl+Z</kbd> / <kbd>Cmd+Z</kbd>).

---

## How It Works

Auto Image Path Updater hooks directly into the VS Code Workspace File System events:

```
┌────────────────────────────────────────────────────────┐
│  VS Code Workspace / File Explorer                     │
│  User moves an image:                                  │
│  assets/images/logo.png  ───►  public/assets/logo.png  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  1. Event-Pairing Queue (Create ⇄ Delete)              │
│     - Pairs asynchronous Create & Delete events        │
│     - 2000ms TTL prevents memory leaks on plain copies │
│     - Captures: fileName, oldRelPath, newRelPath       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  2. Workspace Discovery                                │
│     - Scans **/*.{html,json,css,js,jsx,ts,tsx,md}      │
│     - Automatically excludes node_modules              │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  3. Multi-Pattern Scanner & Path Normalizer            │
│     - HTML regex (src, href, srcset)                   │
│     - CSS regex (url(...))                             │
│     - JS/TS regex (static & dynamic import)            │
│     - Markdown regex (![alt](...))                     │
│     - Resolves relative (../) vs root-relative (/)     │
│     - Verifies absolute path to prevent collisions     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  4. Atomic Workspace Edit                              │
│     - Applies batch changes via vscode.WorkspaceEdit   │
│     - Clean, instantaneous, and fully undoable!        │
└────────────────────────────────────────────────────────┘
```

---

## Supported Languages & Formats

### Supported Document & Source Types

| Document / Language | File Extensions | Syntax Patterns Detected & Updated                              |
| :------------------ | :-------------- | :-------------------------------------------------------------- |
| **HTML**            | `.html`         | `<img src="...">`, `<link href="...">`, `<source srcset="...">` |
| **CSS / SCSS**      | `.css`          | `background-image: url(...)`, `@font-face / @import url(...)`   |
| **JavaScript**      | `.js`, `.jsx`   | `import logo from "..."`, `const img = import("...")`           |
| **TypeScript**      | `.ts`, `.tsx`   | `import hero from "..."`, `import("...")`                       |
| **Markdown**        | `.md`           | `![Alt Text](./path/to/image.png)`                              |
| **JSON**            | `.json`         | `"thumbnail": "./path/to/image.png"`                            |

### Supported Image Formats

| Format   | Extension       | Description                      |
| :------- | :-------------- | :------------------------------- |
| **PNG**  | `.png`          | Portable Network Graphics        |
| **JPEG** | `.jpg`, `.jpeg` | Joint Photographic Experts Group |
| **WebP** | `.webp`         | Modern Web Picture Format        |
| **SVG**  | `.svg`          | Scalable Vector Graphics         |
| **GIF**  | `.gif`          | Graphics Interchange Format      |
| **AVIF** | `.avif`         | AV1 Image File Format            |
| **ICO**  | `.ico`          | Windows Icon / Favicon           |
| **BMP**  | `.bmp`          | Bitmap Image File                |
| **TIFF** | `.tiff`         | Tag Image File Format            |

---

## Usage & Examples

No setup or configuration is required. As soon as you drag-and-drop or rename an image in the VS Code Explorer, Auto Image Path Updater inspects and updates all matching references.

### 1. HTML (`<img>`, `<link>`, `<source>`)

Before moving `assets/images/logo.png` &rarr; `public/logo.png`:

```html
<img src="./assets/images/logo.png" alt="Company Logo" />
```

After move:

```html
<img src="./public/logo.png" alt="Company Logo" />
```

---

### 2. CSS / SCSS (`url(...)`)

Supports single quotes, double quotes, and unquoted URLs. Also seamlessly handles web-root paths:

Before moving `public/illustrations/hero.webp` &rarr; `public/assets/hero.webp`:

```css
.hero-banner {
  background-image: url("/illustrations/hero.webp");
}
```

After move:

```css
.hero-banner {
  background-image: url("/assets/hero.webp");
}
```

---

### 3. JavaScript & TypeScript (`import`)

Works with static ES module imports and dynamic `import()` calls:

Before moving `src/images/banner.png` &rarr; `src/assets/branding/banner.png`:

```typescript
import banner from "./images/banner.png";
```

After move:

```typescript
import banner from "./assets/branding/banner.png";
```

---

### 4. Markdown (`![alt](...)`)

Before moving `docs/images/preview.png` &rarr; `docs/assets/preview.png`:

```markdown
![Dashboard Preview](./images/preview.png)
```

After move:

```markdown
![Dashboard Preview](./assets/preview.png)
```

---

## Under the Hood: Deep Dive into `extension.js`

Auto Image Path Updater combines lightweight event-driven hooks with surgical regex transformations to ensure maximum speed and stability:

### 1. Asynchronous Event-Pairing Queue

Under the hood, moving a file in any operating system emits two distinct events: a `Create` and a `Delete`. Crucially, operating systems do not guarantee which event fires first.

```javascript
let pendingDeletes = new Map(); // filename -> { oldRelativePath, timer }
let pendingCreates = new Map(); // filename -> { newRelativePath, timer }
```

- When a `Create` event fires, it checks `pendingDeletes` for a matching filename. If found, it clears the timer and immediately processes `onImageMoved`.
- If no counterpart is found, the event is parked with a 2-second timeout (`setTimeout`), ensuring standard file creations or deletions do not linger or leak memory.

### 2. Multi-Syntax Regex Matching Engine

Rather than relying on heavy AST parsers for each language, the extension uses specialized regular expressions designed with explicit capture groups:

```javascript
// HTML attributes: src, href, srcset
/(src|href|srcset)\s*=\s*(["'])([^"']*filename[^"']*)\2/g

// CSS url() definitions (quoted or unquoted)
/url\(\s*(["']?)([^"')]*filename[^"'):]*)\1\s*\)/g

// ES Module & dynamic import statements
/(import\s+[\w\s{},*]+\s+from\s+|import\s*\(\s*)(["'])([^"']*filename[^"']*)\2/g

// Markdown image syntax
/(!\[[^\]]*\]\()([^)]*filename[^)]*)\)/g
```

Every pattern defines an explicit `pathGroup` and replacement builder, ensuring the surrounding syntax and original quote styles are preserved intact.

### 3. Smart Web-Root Inference & Relative Path Calculation

When resolving the new path, `resolveNewPath` handles three path categories:

```javascript
// 1. External URLs (http, https, data:) are strictly bypassed
if (
  /^https?:\/\//i.test(matchedSrcValue) ||
  matchedSrcValue.startsWith("data:")
) {
  return null;
}
```

- **Leading Slash / Web-Root URLs**: `path.resolve()` would treat a leading `/` as the OS drive root on Windows. Instead, HopLink/Auto-Path-Renamer infers the project's web root (such as `public/`) by matching the URL suffix with the workspace path, producing a clean, accurate web-root URL.
- **Relative URLs**: Calculates the exact relative path from the scanned source document to the new image location using `path.relative()` and prepends `./` when appropriate.

### 4. Collision Avoidance & Path Normalization

To prevent accidental updates when projects have multiple files with identical basenames (e.g. `src/components/button/icon.png` vs `src/components/card/icon.png`):

```javascript
const matchedAbs = normalisePath(path.resolve(sourceFileDir, matchedSrcValue));
const oldImageAbs = normalisePath(path.join(workspaceRoot, oldRelativePath));

if (matchedAbs !== oldImageAbs) {
  return null; // Different file that shares the same name
}
```

`normalisePath` normalizes path separators and applies case-insensitivity on Windows, ensuring 100% collision-free updates.

### 5. Atomic Workspace Edits

Modifications are batched into a single native `vscode.WorkspaceEdit`:

```javascript
const edit = new vscode.WorkspaceEdit();
// ... accumulate replacements ...
await vscode.workspace.applyEdit(edit);
```

This prevents file race conditions, writes changes instantaneously, and preserves full undo/redo stack compatibility.

---

## Development & Contribution

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [VS Code](https://code.visualstudio.com/) `v1.93.0` or higher

### Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/DeepakCSGO23/Auto-Image-Path-Updater-VSCode-Extension.git
   cd auto-image-path-path-updater
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Launch Extension in Debug Mode:
   - Press <kbd>F5</kbd> in VS Code.
   - An Extension Development Host window will open with the extension active.
   - Open any workspace with images and source files, and test moving image assets.

### Available Scripts

- `npm run lint` — Runs ESLint checks across JavaScript sources.
- `npm test` — Executes integration test suites.

---

## Release Notes

### 2.0.3

- Improved README.md

### 2.0.2

- Improved README.md

### 2.0.1

- **Optimization**: Cleaned up demo media assets for a lightweight package distribution.

### 2.0.0

- **Bidirectional Move Detection**: Re-architected file watcher handling to support both `delete -> create` and `create -> delete` event cycles across all operating systems.
- **Root-Relative & Public URL Support**: Added smart resolution for leading-slash URLs (e.g., `/illustrations/image.webp`) commonly found in web apps and public asset folders.
- **Expanded Syntax Coverage**: Added full support for CSS `url(...)`, Markdown images `![alt](...)`, and ES module `import` declarations.
- **New File Types**: Added support for TypeScript (`.ts`, `.tsx`) and Markdown (`.md`).
- **Additional Image Formats**: Added support for `.ico`, `.avif`, `.bmp`, and `.tiff`.
- **Quote Style Preservation**: Matches and preserves original quote formatting (single vs. double quotes).
- **Collision Protection**: Prevents duplicate name overwrites by resolving and verifying the exact previous file path.
- **Stability & Performance**: Fixed potential crashes when no workspace folder is open, prevented memory leaks via auto-expiring cache entries, and added automatic resource disposal.

### 1.0.1

- Added support for JavaScript XML files (`.jsx`).

### 1.0.0

- Initial release: basic image `src` updates for HTML, CSS, JavaScript, and JSON.

---

## Support & Donate

If **Auto Image Path Updater** saves you time and keeps your projects free of broken links, please consider supporting its ongoing maintenance and development:

<p align="center">
  <a href="https://razorpay.me/@lonealpha">
    <img src="https://img.shields.io/badge/Donate-Razorpay-0C2340?style=for-the-badge&logo=razorpay&logoColor=white" alt="Donate via Razorpay" />
  </a>
  <a href="https://buymeacoffee.com/deepakkn">
    <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me a Coffee" />
  </a>
  <a href="https://github.com/sponsors/DeepakCSGO23">
    <img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="Sponsor on GitHub" />
  </a>
</p>

You can also donate directly at [lonealpha.in/donate](https://lonealpha.in/donate).

---

## License

This extension is licensed under the [MIT License](LICENSE).
