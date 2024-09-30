## Auto Path Renamer

**Auto Path Renamer** is a Visual Studio Code extension designed to automatically update `src` paths in HTML files when image files are moved. This extension eliminates the need to manually edit paths, ensuring that all references to image files in your project remain accurate after a file is relocated.

## Features

- Automatically detects when an image file (`.png`, `.jpg`, `.jpeg`, `.gif`) is moved or renamed.
- Automatically updates the `src` attribute in HTML, JSON, CSS, and JS files to reflect the new file path.
- Supports multiple file types for `src` path updates.
- Logs all file changes in the output channel to provide clear feedback about what changes were made.

### Example

If you move an image file from `assets/images/logo.png` to `assets/logo.png`, this extension will automatically update the `src` paths in relevant files from:

```html
<img src="assets/images/logo.png" alt="Logo" />
```

to:

```html
<img src="assets/logo.png" alt="Logo" />
```

## Requirements

- Visual Studio Code version 1.60.0 or higher.
- No additional dependencies are required.

## Extension Settings

This extension does not contribute any custom settings at the moment, but future releases may include configurable options.

## Known Issues

- The extension works most of the time but occasionally misses path updates (approximately 5% failure rate). This is an area of ongoing improvement.

## Release Notes

### 1.0.0

- Initial release of Auto Path Renamer.
- Automatically detects image file moves and updates `src` paths in HTML files.

---

## For more information

- [GitHub Repository](https://github.com/DeepakCSGO23/Auto-Image-Path-Updater-VSCode-Extension)

---

## Donations

If you find Auto Path Renamer helpful and would like to support its continued development, consider making a donation. Your contributions help us maintain and improve the project!

[Donate Here ❤️](https://buymeacoffee.com/deepakkn)

Thank you for your support!

**Enjoy smarter, cleaner code with Smart Commenting!**
