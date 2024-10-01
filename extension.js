// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode=require('vscode');
const path=require('path');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let createdFiles=new Map();
let watcher;
/**
 * @param {vscode.ExtensionContext} context
 */
// This method is called when the extension is first installed 
async function activate(){
	// Creating a FileSystemWatcher to watch all image files in the workspace
	watcher=vscode.workspace.createFileSystemWatcher('**/*.{png,jpg,jpeg,gif,svg,webp}');
	// * For detecting moving of a image file we have to combine both creating & deleting file watcher so when a user moves the file it first gets deleted so we store the file name in a map then when the watcher detects a file creation we check if the file name matches with the file which is deleted
	// Watch if any new image files are created
	watcher.onDidCreate(async(uri)=>{
		// Getting the file name of the file which is created
		const newFileName=path.basename(uri.fsPath);
		// Getting the path where the new file is created
		const newFilePath=path.relative(vscode.workspace.workspaceFolders[0].uri.fsPath,uri.fsPath).replace(/\\/g,'/');
		// Store the file name and path of the newly created file so that we can check if the same file is deleted so that we can confirm it is a move operation
		createdFiles.set(newFileName,newFilePath);
	})
	// Watch if any image is deleted
	watcher.onDidDelete(async(uri)=>{
		// Getting the file name of file which was deleted
		const oldFileName=path.basename(uri.fsPath);
		// Checking if the file deleted is created i.e move operation
		if(createdFiles.get(oldFileName)){
			// Getting all the files in vscode workspace
			const files=await vscode.workspace.findFiles('**/*.{html,json,css,js}','**/node_modules/**');
			// Creating a workspace edit to make changes to the files even when the files are not active or inactive. We no longer open and save every file for each change, Instead we use workspace edit to batch all changes together
			const edit=new vscode.WorkspaceEdit();
			// Getting the new file path i.e the path which the deleted file is created into
			const newFilePath=createdFiles.get(oldFileName);
			for(const file of files){
				// First Open the text files if not opened
				const document=await vscode.workspace.openTextDocument(file);
				// Extract the text from the document
				const text=document.getText();
				// Calculate the relative path from the current file to the new image location
                const currentFilePath = path.dirname(file.fsPath);
                const newImagePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, newFilePath);
                const relativePath = path.relative(currentFilePath, newImagePath).replace(/\\/g, '/');
				// Regex initialization
                const regex=new RegExp(`src\\s*=\\s*["']([^"']*${oldFileName}[^"']*)["']`,'g');
				let match;
				while((match=regex.exec(text))!==null){
					const range=new vscode.Range(document.positionAt(match.index),document.positionAt(match.index+match[0].length));
					// Takes the file it wants to edit , position of the old path & replace it with new filepath
					edit.replace(file,range,`src="${relativePath}"`);
				}
			}
			// Apply the workspace edit on the current workspace this makes sure all the files in the current workspace are saved at once
			await vscode.workspace.applyEdit(edit);
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
}

module.exports={
	activate,
	deactivate
}
