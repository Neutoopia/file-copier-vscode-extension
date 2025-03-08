# Project File Copier

A VS Code extension that copies code from all files in your project, excluding specified folders and file patterns, and formats the output with file paths and proper spacing.

<p align="center">
  <img src="images/icon.png" width="128" alt="Project File Copier Icon">
</p>

## Features

- Copy all text files from your workspace into a single document
- Exclude specific folders (configurable)
- Exclude specific file patterns (configurable)
- Add file path headers and spacing between file contents
- Option to copy to clipboard or create a new file
- Skip binary files and large files automatically

## Usage

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
2. Type "Copy Project Files" and select the command
3. Choose whether to modify the excluded folders or file patterns
4. Choose whether to save as a file or copy to clipboard

![Extension Demo](images/demo.gif)

## Extension Settings

This extension contributes the following settings:

* `fileCopier.excludedFolders`: Array of folder names to exclude when copying files (default: ["node_modules", ".git", ".vscode"])
* `fileCopier.excludedPatterns`: Array of file patterns to exclude (default: ["*.exe", "*.dll", "*.jpg", "*.png", "*.pdf"])

## Installation

### From VS Code Marketplace:

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "Project File Copier"
4. Click Install

### From VSIX file:

1. Download the `.vsix` file
2. Open VS Code
3. Go to the Extensions view (Ctrl+Shift+X)
4. Click on the "..." at the top of the Extensions view
5. Select "Install from VSIX..."
6. Navigate to and select the downloaded `.vsix` file

### Development Installation:

1. Clone the repository
2. Open the folder in VS Code
3. Run `npm install`
4. Press F5 to run the extension in a new Extension Development Host window
5. Use the command "Copy Project Files" from the Command Palette

## Building the VSIX package

1. Install `vsce` (VS Code Extension Manager) if not already installed:
   ```
   npm install -g @vscode/vsce
   ```
2. Navigate to the extension folder
3. Run:
   ```
   npm run package
   ```
   or
   ```
   vsce package
   ```
4. This will create a `.vsix` file in the same directory

## Release Notes

### 0.1.0

- Initial release
- Support for folder exclusions
- Support for file pattern exclusions
- Copy to clipboard or create file options

## Privacy

This extension does not collect any data or send any information outside your local machine.

## License

[MIT](LICENSE)

Copyright (c) 2025 Emmanuel Yegon