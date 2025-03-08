// Extension entry point
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const minimatch = require('minimatch');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Extension "file-copier" is now active!');

    let disposable = vscode.commands.registerCommand('file-copier.copyProjectFiles', async function () {
        try {
            // Get workspace folder
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage('No workspace folder open');
                return;
            }
            const rootPath = workspaceFolders[0].uri.fsPath;
            
            // Get user-specified exclusions
            const config = vscode.workspace.getConfiguration('fileCopier');
            let excludedFolders = config.get('excludedFolders', ['node_modules', '.git', '.vscode', '.next', '.vscode']);
            let excludedPatterns = config.get('excludedPatterns', ['*.exe', '*.dll', '*.jpg', '*.png', '*.pdf', '*.png', '*.jpeg', '*.avif', '*.webp', '*.mp3', '*.wav', '*.mp4', '*.docx', '*.ico', '*.vsix', '*.gitignore', "*.env", '*.json']);
            
            // First, ask about folder exclusions
            const modifyFolderExcludes = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: `Current excluded folders: ${excludedFolders.join(', ')}. Modify?`
            });

            if (modifyFolderExcludes === 'Yes') {
                const input = await vscode.window.showInputBox({
                    prompt: 'Enter comma-separated folders to exclude',
                    value: excludedFolders.join(', ')
                });
                
                if (input !== undefined) {
                    excludedFolders = input.split(',').map(folder => folder.trim());
                    await config.update('excludedFolders', excludedFolders, vscode.ConfigurationTarget.Workspace);
                }
            }
            
            // Then, ask about file pattern exclusions
            const modifyPatternExcludes = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: `Current excluded patterns: ${excludedPatterns.join(', ')}. Modify?`
            });

            if (modifyPatternExcludes === 'Yes') {
                const input = await vscode.window.showInputBox({
                    prompt: 'Enter comma-separated patterns to exclude (e.g., *.jpg, data.json)',
                    value: excludedPatterns.join(', ')
                });
                
                if (input !== undefined) {
                    excludedPatterns = input.split(',').map(pattern => pattern.trim());
                    await config.update('excludedPatterns', excludedPatterns, vscode.ConfigurationTarget.Workspace);
                }
            }

            vscode.window.showInformationMessage(`Copying files (excluding folders: ${excludedFolders.join(', ')} and patterns: ${excludedPatterns.join(', ')})...`);
            
            // Process files and build output
            const result = await processFiles(rootPath, excludedFolders, excludedPatterns);
            
            // Create output file or copy to clipboard based on user preference
            const outputChoice = await vscode.window.showQuickPick(['Create file', 'Copy to clipboard'], {
                placeHolder: 'How would you like to output the copied content?'
            });
            
            if (outputChoice === 'Create file') {
                // Let user specify the output filename
                const defaultFilename = 'project-files-content.txt';
                const outputFilename = await vscode.window.showInputBox({
                    prompt: 'Enter output filename',
                    value: defaultFilename,
                    validateInput: (value) => {
                        return value && value.trim().length > 0 ? null : 'Filename cannot be empty';
                    }
                });
                
                if (!outputFilename) return; // User cancelled
                
                const outputPath = path.join(rootPath, outputFilename);
                fs.writeFileSync(outputPath, result);
                const openDoc = await vscode.workspace.openTextDocument(outputPath);
                await vscode.window.showTextDocument(openDoc);
                vscode.window.showInformationMessage(`Files copied to: ${outputPath}`);
            } else if (outputChoice === 'Copy to clipboard') {
                await vscode.env.clipboard.writeText(result);
                vscode.window.showInformationMessage('Files copied to clipboard');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

async function processFiles(rootPath, excludedFolders, excludedPatterns) {
    let result = '';
    let processedFiles = 0;
    
    async function traverseDirectory(directory, relativePath = '') {
        const entries = fs.readdirSync(directory, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            const entryRelativePath = path.join(relativePath, entry.name);
            
            if (entry.isDirectory()) {
                // Skip excluded folders
                if (excludedFolders.includes(entry.name)) {
                    continue;
                }
                await traverseDirectory(fullPath, entryRelativePath);
            } else {
                try {
                    // Skip files matching excluded patterns
                    const shouldExclude = excludedPatterns.some(pattern => 
                        minimatch(entry.name, pattern, { nocase: true })
                    );
                    
                    if (shouldExclude) {
                        continue;
                    }
                    
                    // Skip binary files and very large files
                    const stats = fs.statSync(fullPath);
                    if (stats.size > 1024 * 1024) { // Skip files larger than 1MB
                        continue;
                    }
                    
                    const content = fs.readFileSync(fullPath, 'utf8');
                    
                    // Add file header and content to result
                    result += `\n\n========================================\n`;
                    result += `File: ${entryRelativePath}\n`;
                    result += `========================================\n\n`;
                    result += content;
                    result += '\n\n';
                    
                    processedFiles++;
                } catch (error) {
                    // Skip files that can't be read as text
                    console.log(`Skipping file ${fullPath}: ${error.message}`);
                }
            }
        }
    }
    
    await traverseDirectory(rootPath);
    
    // Add summary at the beginning
    const summary = `Project Files Summary\n` +
                    `===================\n` +
                    `Generated on: ${new Date().toLocaleString()}\n` +
                    `Files processed: ${processedFiles}\n` +
                    `Excluded folders: ${excludedFolders.join(', ')}\n` +
                    `Excluded patterns: ${excludedPatterns.join(', ')}\n\n`;
                    
    return summary + result;
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};