# Auto Image Path Updater

**Auto Image Path Updater** is a Visual Studio Code extension that helps developers automatically update `src` paths in HTML files when image files are moved. This extension saves you from the hassle of manually adjusting file paths, ensuring that all image references in your project stay correct after a file is relocated.

## Features

- Automatically detects when image files (`.png`, `.jpg`, `.jpeg`, `.gif`,`.svg`,`.webp`) are moved or renamed.
- Updates the `src` attribute in HTML, JSON, CSS, and JavaScript files to reflect the new image file path.
- Logs all file changes in the output channel for transparency and debugging purposes.

### Example

If you move an image file from:

`assets/images/logo.png`

to:

`assets/logo.png`

the extension will update the path in your HTML file from:

```html
<img src="assets/images/logo.png" alt="Logo" />
```

to:

```html
<img src="assets/logo.png" alt="Logo" />
```

## Extension Settings

There are currently no customizable settings in this version of the extension. Future versions may include user-configurable options.

## Known Issues

- Occasionally, the extension may miss updating paths in certain files (around a 5% failure rate). This is being actively improved.

## Release Notes

### 1.0.0

- Automatically updates image `src` paths in HTML, JSON, CSS, and JavaScript files when an image file is moved.

- Added Relative paths for 100% image path sync accuracy.

## Contributing

If you encounter any bugs or have suggestions for new features, feel free to raise an issue or submit a pull request on our GitHub repository.

[GitHub Repository](https://github.com/DeepakCSGO23/Auto-Image-Path-Updater-VSCode-Extension)

## Support

If this extension has helped improve your workflow, consider supporting its ongoing development!

[Donate Here ❤️](https://buymeacoffee.com/deepakkn)

---

Thank you for using Auto Image Path Updater!
