const vscode = require("vscode");
const path = require("path");

// To detect a move we need both a Create and a Delete for the same filename.
// The event order is NOT guaranteed — on some OSes Create fires first, on
// others Delete fires first. We track both sides and process as soon as we
// have seen both events.
let pendingDeletes = new Map(); // filename -> { oldRelativePath, timer }
let pendingCreates = new Map(); // filename -> { newRelativePath, timer }
let watcher;

/**
 * Returns the workspace root path, or null if no workspace is open.
 * @returns {string|null}
 */
function getWorkspaceRoot() {
  if (!vscode.workspace.workspaceFolders?.length) return null;
  return vscode.workspace.workspaceFolders[0].uri.fsPath;
}

/**
 * Ensures a relative path starts with './' so browsers treat it as relative.
 * @param {string} relPath
 * @returns {string}
 */
function ensureRelativePrefix(relPath) {
  if (!relPath.startsWith(".") && !relPath.startsWith("/")) {
    return "./" + relPath;
  }
  return relPath;
}

/**
 * Normalise a filesystem path for reliable equality comparison.
 * Windows is case-insensitive, so we lowercase there, and we always
 * normalise separators via path.normalize.
 * @param {string} p
 * @returns {string}
 */
function normalisePath(p) {
  const n = path.normalize(p);
  return process.platform === "win32" ? n.toLowerCase() : n;
}

/**
 * Given a matched src/url value, check whether it refers to the moved image
 * and — if it does — return the correct new path string to replace it with.
 * Returns null if this value does not refer to the moved image.
 *
 * Handles three kinds of path values:
 *   1. External URLs  (http://, https://, data:) — always skip
 *   2. Root-relative  (/illustrations/img.png)   — resolve via web-root inference
 *   3. Relative        (./images/img.png)         — resolve via filesystem
 *
 * @param {string} matchedSrcValue   The raw path string found in source code
 * @param {string} oldRelativePath   Workspace-relative path before the move
 * @param {string} newRelativePath   Workspace-relative path after  the move
 * @param {string} sourceFileDir     Absolute dir of the file being scanned
 * @param {string} workspaceRoot     Absolute workspace root path
 * @returns {string|null}
 */
function resolveNewPath(
  matchedSrcValue,
  oldRelativePath,
  newRelativePath,
  sourceFileDir,
  workspaceRoot,
) {
  // 1. Never touch external or data URLs
  if (
    /^https?:\/\//i.test(matchedSrcValue) ||
    matchedSrcValue.startsWith("data:")
  ) {
    return null;
  }

  const newImageAbsPath = path.join(workspaceRoot, newRelativePath);

  if (matchedSrcValue.startsWith("/")) {
    // ── 2. Root-relative URL  (e.g. "/illustrations/bg-decoration.webp") ──────
    // path.resolve() treats leading "/" as the OS drive root on Windows,
    // so we cannot use it here. Instead we infer the "web root" directory
    // by finding the suffix that the URL path shares with the fs path:
    //
    //   URL path  (no leading /):  "illustrations/bg-decoration.webp"
    //   Old fs path:               "public/illustrations/bg-decoration.webp"
    //   → webRoot = "public/"
    //
    // Then the new URL = "/" + (new fs path  minus webRoot prefix).

    const urlPathPart = matchedSrcValue.slice(1); // strip leading "/"

    // Case-insensitive suffix check on Windows
    const normalOldRel =
      process.platform === "win32"
        ? oldRelativePath.toLowerCase()
        : oldRelativePath;
    const normalUrlPart =
      process.platform === "win32" ? urlPathPart.toLowerCase() : urlPathPart;

    if (!normalOldRel.endsWith(normalUrlPart)) {
      return null; // This URL doesn't point to our image
    }

    // webRoot = "public/" or "" (if the image is at workspace root)
    const webRoot = oldRelativePath.slice(
      0,
      oldRelativePath.length - urlPathPart.length,
    );

    // Build the new root-relative URL
    if (webRoot && newRelativePath.startsWith(webRoot)) {
      return "/" + newRelativePath.slice(webRoot.length);
    }
    // Fallback: image moved outside the inferred web root; use full fs path
    return "/" + newRelativePath;
  } else {
    // ── 3. Relative path  (e.g. "./images/bg-decoration.webp") ────────────────
    const matchedAbs = normalisePath(
      path.resolve(sourceFileDir, matchedSrcValue),
    );
    const oldImageAbs = normalisePath(
      path.join(workspaceRoot, oldRelativePath),
    );

    if (matchedAbs !== oldImageAbs) {
      return null; // Different file that shares the same name
    }

    return ensureRelativePrefix(
      path.relative(sourceFileDir, newImageAbsPath).replace(/\\/g, "/"),
    );
  }
}

/**
 * Builds regex patterns for every way an image path can appear in source code.
 * Each pattern declares an explicit `pathGroup` so the correct capture group
 * is always read — offset-from-length arithmetic breaks when patterns have
 * different numbers of groups.
 * @param {string} filename   Bare image filename, e.g. "photo.png"
 */
function buildPatterns(filename) {
  const esc = filename.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [
    // HTML:  src="path"  href="path"  srcset="path"
    // Groups: 1=attr  2=quote  3=PATH
    {
      regex: new RegExp(
        `(src|href|srcset)\\s*=\\s*(["'])([^"']*${esc}[^"']*)\\2`,
        "g",
      ),
      pathGroup: 3,
      buildReplacement: (match, newPath) =>
        `${match[1]}=${match[2]}${newPath}${match[2]}`,
    },
    // CSS:  url('path')  url("path")  url(path)
    // Groups: 1=quote  2=PATH
    {
      regex: new RegExp(
        `url\\(\\s*(["']?)([^"')]*${esc}[^"'):]*)\\1\\s*\\)`,
        "g",
      ),
      pathGroup: 2,
      buildReplacement: (match, newPath) =>
        `url(${match[1]}${newPath}${match[1]})`,
    },
    // JS/TS import:  import x from './path'  or  import('./path')
    // Groups: 1=keyword  2=quote  3=PATH
    {
      regex: new RegExp(
        `(import\\s+[\\w\\s{},*]+\\s+from\\s+|import\\s*\\(\\s*)(["'])([^"']*${esc}[^"']*)\\2`,
        "g",
      ),
      pathGroup: 3,
      buildReplacement: (match, newPath) =>
        `${match[1]}${match[2]}${newPath}${match[2]}`,
    },
    // Markdown:  ![alt](path)
    // Groups: 1=prefix "![alt]("  2=PATH
    {
      regex: new RegExp(`(!\\[[^\\]]*\\]\\()([^)]*${esc}[^)]*)\\)`, "g"),
      pathGroup: 2,
      buildReplacement: (match, newPath) => `${match[1]}${newPath})`,
    },
  ];
}

/**
 * Core move handler — called once we have confirmed both old and new paths.
 * @param {string} fileName
 * @param {string} oldRelativePath  workspace-relative, forward slashes
 * @param {string} newRelativePath  workspace-relative, forward slashes
 */
async function onImageMoved(fileName, oldRelativePath, newRelativePath) {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) return;

  const files = await vscode.workspace.findFiles(
    "**/*.{html,json,css,js,jsx,ts,tsx,md}",
    "**/node_modules/**",
  );

  const edit = new vscode.WorkspaceEdit();
  const patterns = buildPatterns(fileName);

  for (const file of files) {
    const document = await vscode.workspace.openTextDocument(file);
    const text = document.getText();
    const sourceFileDir = path.dirname(file.fsPath);

    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0; // reset stateful regex before every reuse

      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        const matchedSrcValue = match[pattern.pathGroup];

        const newPath = resolveNewPath(
          matchedSrcValue,
          oldRelativePath,
          newRelativePath,
          sourceFileDir,
          workspaceRoot,
        );

        if (newPath === null) continue; // not our image

        const range = new vscode.Range(
          document.positionAt(match.index),
          document.positionAt(match.index + match[0].length),
        );

        edit.replace(file, range, pattern.buildReplacement(match, newPath));
      }
    }
  }

  await vscode.workspace.applyEdit(edit);
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
  if (!getWorkspaceRoot()) return;

  watcher = vscode.workspace.createFileSystemWatcher(
    "**/*.{png,jpg,jpeg,gif,svg,webp,ico,avif,bmp,tiff}",
  );

  // ── Move detection ──────────────────────────────────────────────────────────
  // A move = one Create + one Delete for the same filename.
  // Whichever event arrives first is parked; the second triggers onImageMoved.
  // Entries that never find a partner expire after 2 s (plain copy / delete).

  watcher.onDidCreate((uri) => {
    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) return;

    const fileName = path.basename(uri.fsPath);
    const newRelativePath = path
      .relative(workspaceRoot, uri.fsPath)
      .replace(/\\/g, "/");

    const deleteEntry = pendingDeletes.get(fileName);
    if (deleteEntry) {
      // Delete already arrived — we have both halves, process now
      clearTimeout(deleteEntry.timer);
      pendingDeletes.delete(fileName);
      onImageMoved(fileName, deleteEntry.oldRelativePath, newRelativePath);
      return;
    }

    // Delete hasn't arrived yet — park and wait
    const timer = setTimeout(() => pendingCreates.delete(fileName), 2000);
    pendingCreates.set(fileName, { newRelativePath, timer });
  });

  watcher.onDidDelete((uri) => {
    const workspaceRoot = getWorkspaceRoot();
    if (!workspaceRoot) return;

    const fileName = path.basename(uri.fsPath);
    const oldRelativePath = path
      .relative(workspaceRoot, uri.fsPath)
      .replace(/\\/g, "/");

    const createEntry = pendingCreates.get(fileName);
    if (createEntry) {
      // Create already arrived — we have both halves, process now
      clearTimeout(createEntry.timer);
      pendingCreates.delete(fileName);
      onImageMoved(fileName, oldRelativePath, createEntry.newRelativePath);
      return;
    }

    // Create hasn't arrived yet — park and wait
    const timer = setTimeout(() => pendingDeletes.delete(fileName), 2000);
    pendingDeletes.set(fileName, { oldRelativePath, timer });
  });

  // Register on subscriptions so VS Code disposes it automatically on deactivate
  context.subscriptions.push(watcher);
}

// This method is called when your extension is deactivated
function deactivate() {
  if (watcher) {
    watcher.dispose();
  }
  pendingDeletes.clear();
  pendingCreates.clear();
}

module.exports = { activate, deactivate };
