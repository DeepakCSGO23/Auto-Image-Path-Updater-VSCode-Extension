# Change Log

All notable changes to the "auto-image-path-path-updater" extension will be documented in this file.

## [2.0.0]

### Added
- **Bidirectional Move Detection:** Handles both `delete -> create` and `create -> delete` event firing orders across Windows, macOS, and Linux.
- **Root-Relative URL Resolution:** Accurately rewrites leading-slash URLs (e.g. `url("/illustrations/bg-decoration.webp")`) in web projects without breaking public folder root references.
- **Support for CSS, Markdown, & Imports:** Added regex matchers and transformers for:
  - CSS `url(...)` declarations (supporting quoted and unquoted values)
  - Markdown images `![alt](...)`
  - JavaScript / TypeScript `import` statements and dynamic `import()`
  - HTML `srcset` and `href` attributes
- **Expanded File Formats:** Scans TypeScript (`.ts`, `.tsx`) and Markdown (`.md`) files in addition to HTML, CSS, JS, JSX, and JSON.
- **Additional Image Formats:** Expanded watcher to support `.ico`, `.avif`, `.bmp`, and `.tiff`.
- **Quote Style Preservation:** Preserves original single/double quote formatting upon replacement.

### Fixed
- **Path Collision Bug:** Resolved and verified old file paths against references so files sharing identical filenames in different directories are not mistakenly updated.
- **Windows Path Normalization:** Normalized case-insensitivity and backslash/forward-slash differences during path comparison.
- **Resource Management & Stability:** Handled missing workspace folder gracefully, introduced 2-second auto-expiry for unmatched move events to eliminate memory leaks, and added watcher subscriptions to extension context.

---

## [1.0.1]

### Added
- Added support for JavaScript XML files (`.jsx`).

---

## [1.0.0]

### Added
- Initial release with automatic updates for image `src` paths in HTML, JSON, CSS, and JavaScript.
