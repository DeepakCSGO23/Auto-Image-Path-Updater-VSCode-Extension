# Auto Image Path Updater

**Auto Image Path Updater** is a Visual Studio Code extension that automatically updates image paths across your codebase whenever an image file is moved or relocated. Say goodbye to broken image links and manual updates across your projects!

---

## 🚀 Features

- **Automatic Move Detection:** Accurately detects when images are moved across directories, handling both creation and deletion event orders seamlessly.
- **Multi-Format Image Support:** Supports `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`, `.ico`, `.avif`, `.bmp`, and `.tiff`.
- **Broad File & Syntax Support:** Automatically scans and updates image references across:
  - **HTML:** `src`, `href`, and `srcset` attributes
  - **CSS / SCSS:** `url(...)` declarations (supporting single, double, or unquoted values)
  - **JavaScript & TypeScript (`.js`, `.jsx`, `.ts`, `.tsx`):** static and dynamic `import` statements
  - **Markdown (`.md`):** standard image syntax `![alt](path)`
  - **JSON (`.json`)**
- **Smart Path Resolution:**
  - **Relative Paths:** Automatically calculates relative paths (`./` and `../`) based on the location of the referencing file.
  - **Root-Relative URLs:** Intelligently handles root-relative paths like `url("/illustrations/bg-decoration.webp")` (commonly used in web frameworks like Vite, Next.js, React, and public directories).
  - **External URL Protection:** Ignores external resources (`http://`, `https://`, `data:`).
- **Safe Matching & Style Preservation:**
  - Validates that the referenced image matches the exact previous location before modifying, preventing collisions when multiple images share the same filename.
  - Preserves original quote styles (single quotes, double quotes, or parenthesis).
  - Multi-platform compatibility with normalized, case-insensitive path checks on Windows.

---

## 💡 Example

### HTML (`<img>` tags)

Before moving `assets/images/logo.png` to `public/logo.png`:

```html
<img src="./assets/images/logo.png" alt="Logo" />
```

After move:

```html
<img src="./public/logo.png" alt="Logo" />
```

### CSS (`url(...)`)

Before moving `public/illustrations/bg-decoration.webp` to `public/assets/bg-decoration.webp`:

```css
.bg-image {
  background-image: url("/illustrations/bg-decoration.webp");
}
```

After move:

```css
.bg-image {
  background-image: url("/assets/bg-decoration.webp");
}
```

### JavaScript / TypeScript (`import`)

Before moving `src/images/banner.png` to `src/assets/banner.png`:

```javascript
import banner from "./images/banner.png";
```

After move:

```javascript
import banner from "./assets/banner.png";
```

### Markdown

```markdown
![Dashboard Preview](./screenshots/dashboard.png)
```

---

## ⚙️ Extension Settings

Currently, there are no configurable settings required. The extension works out-of-the-box upon opening a workspace folder.

---

## 📋 Release Notes

### 2.0.0

- **Bidirectional Move Detection:** Re-architected file watcher handling to support both `delete -> create` and `create -> delete` event cycles across all operating systems.
- **Root-Relative & Public URL Support:** Added smart resolution for leading-slash URLs (e.g., `/illustrations/image.webp`) commonly found in web apps and public asset folders.
- **Expanded Syntax Coverage:** Added full support for CSS `url(...)`, Markdown images `![alt](...)`, and ES module `import` declarations.
- **New File Types:** Added support for TypeScript (`.ts`, `.tsx`) and Markdown (`.md`).
- **Additional Image Formats:** Added support for `.ico`, `.avif`, `.bmp`, and `.tiff`.
- **Quote Style Preservation:** Matches and preserves original quote formatting (single vs. double quotes).
- **Collision Protection:** Prevents duplicate name overwrites by resolving and verifying the exact previous file path.
- **Stability & Performance:** Fixed potential crashes when no workspace folder is open, prevented memory leaks via auto-expiring cache entries, and added automatic resource disposal.

### 1.0.1

- Added support for JavaScript XML files (`.jsx`).

### 1.0.0

- Initial release: basic image `src` updates for HTML, CSS, JavaScript, and JSON.

---

## 🤝 Contributing

If you encounter any issues or have feature requests, please submit an issue or pull request on GitHub!

[GitHub Repository](https://github.com/DeepakCSGO23/Auto-Image-Path-Updater-VSCode-Extension)

## ❤️ Support

If this extension saves you time, consider supporting its development:

[Donate Here ❤️](https://lonealpha.in/donate)

---

Thank you for using Auto Image Path Updater!
