// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let createdFiles=new Map();
let watcher;
let output;
/**
 * @param {vscode.ExtensionContext} context
 */
async function activate() {
	// Getting current workspace
	//const document=await vscode.workspace;
	// Creating output channel
	output=vscode.window.createOutputChannel("Auto Path Renamer");
	output.show();
	// Creating a FileSystemWatcher to watch all image files in the workspace
	watcher=vscode.workspace.createFileSystemWatcher('**/*.{png,jpg,jpeg,gif}');
	// * For detecting moving of a image file we have to combine both creating & deleting file watcher so when a user moves the file it first gets deleted so we store the file name in a map then when the watcher detects a file creation we check if the file name matches with the file which is deleted
	// Watch if any new image files are created
	watcher.onDidCreate(async(uri)=>{
		// Getting the file name of the file which is created
		const newFileName=path.basename(uri.fsPath);
		// Getting the path where the new file is created
		const newFilePath=path.relative(vscode.workspace.workspaceFolders[0].uri.fsPath,uri.fsPath).replace(/\\/g,'/');
		output.appendLine(`File name : ${newFileName} is created at ${newFilePath}\n`);
		// Store the file name and path of the newly created file so that we can check if the same file is deleted so that we can confirm it is a move operation
		createdFiles.set(newFileName,newFilePath);
	})
	// Watch if any image is deleted
	watcher.onDidDelete(async(uri)=>{
		// Getting the file name of file which was deleted
		const oldFileName=path.basename(uri.fsPath);
		// Getting the file path of file which was deleted
		const oldFilePath=path.relative(vscode.workspace.workspaceFolders[0].uri.fsPath,uri.fsPath).replace(/\\/g,'/');
		output.appendLine(`File name : ${oldFileName} is deleted from ${oldFilePath}\n`);
		// Checking if the file deleted is created i.e move operation
		if(createdFiles.get(oldFileName)){
			// Getting all the files in vscode workspace
			const files=await vscode.workspace.findFiles('**/*.{html,json,css,js}','**/node_modules/**');
			for(const file of files){
				// First Open the text files if not opened
				const document=await vscode.workspace.openTextDocument(file);
				// Extract the text from the document
				const text=document.getText();
				// Creating a workspace edit to make changes to the files even when the files are not active or inactive
				const edit=new vscode.WorkspaceEdit();
				// Regex initialization
                const regex=new RegExp(`src\\s*=\\s*["']([^"']*${oldFileName}[^"']*)["']`,'g');
				let match;
				// Getting the new file path i.e the path which the deleted file is created into
				const newFilePath=createdFiles.get(oldFileName);
				while((match=regex.exec(text))!==null){
					output.appendLine(`file ${file.fsPath} contains ${match} at position ${match.index} ${match.index+match[0].length}`)
					const range=new vscode.Range(document.positionAt(match.index),document.positionAt(match.index+match[0].length));
					// Takes the file it wants to edit , position of the old path & replace it with new filepath
					edit.replace(file,range,`src="${newFilePath}"`);
				}
				// Apply the workspace edit on the selected file
				await vscode.workspace.applyEdit(edit);
				// Save the document so that the changes are updated in-memory
				await document.save();
			}
			//* Delete the file from created Files map
			createdFiles.delete(oldFileName);
		}
	})
}

// This method is called when your extension is deactivated (to prevent memory leaks and memory freeup)
function deactivate(){
	// Disposing the watcher
	if(watcher){
		watcher.dispose();
	}
	// Disposing the output pipeline
	if(output){
		output.dispose();
	}
}

module.exports = {
	activate,
	deactivate
}
