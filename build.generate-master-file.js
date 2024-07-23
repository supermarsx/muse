// generateEntry.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Get all matching files
const entryFiles = glob.sync('source/*.ts*');

// Master file
const masterFile = 'master.ts';

// Path to the generated central entry file
const entryFilePath = path.resolve(__dirname, 'source', masterFile);

// Generate the import statements
const imports = entryFiles.map(fileMap).join('\n');

// File mapper
function fileMap(file, index) {
    if (file.toString().includes(masterFile)) return '';
    return `export * from './${path.relative(path.dirname(entryFilePath), file).toString().split('.')[0]}';`
}

// File contents
const masterFileContents = `
/**
 * Master
 */

${imports}

`;

// Write the import statements to the central entry file
fs.writeFileSync(entryFilePath, masterFileContents, 'utf8');

console.log(`Generated entry file at ${entryFilePath}`);
