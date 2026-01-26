const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SHARED_MODELS_DIR = '/home/saikumar/adminvault/packages/libs/shared-models/src';
const PROJECT_ROOT = '/home/saikumar/adminvault/packages';

// Recursive function to get all .ts files
function getFiles(dir) {
    const subdirs = fs.readdirSync(dir);
    const files = subdirs.map(subdir => {
        const res = path.resolve(dir, subdir);
        return fs.statSync(res).isDirectory() ? getFiles(res) : res;
    });
    return files.reduce((a, f) => a.concat(f), []);
}

// Function to extract exports from a file
function getExports(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const exports = [];
    const classMatches = content.matchAll(/export class (\w+)/g);
    const interfaceMatches = content.matchAll(/export interface (\w+)/g);
    const enumMatches = content.matchAll(/export enum (\w+)/g);
    const typeMatches = content.matchAll(/export type (\w+)/g);

    for (const match of classMatches) exports.push({ name: match[1], type: 'class', file: filePath });
    for (const match of interfaceMatches) exports.push({ name: match[1], type: 'interface', file: filePath });
    for (const match of enumMatches) exports.push({ name: match[1], type: 'enum', file: filePath });
    for (const match of typeMatches) exports.push({ name: match[1], type: 'type', file: filePath });

    return exports;
}

// Main execution
const allFiles = getFiles(SHARED_MODELS_DIR).filter(f => f.endsWith('.ts') && !f.endsWith('index.ts'));
let allExports = [];

allFiles.forEach(file => {
    allExports = allExports.concat(getExports(file));
});

console.log(`Found ${allExports.length} exported symbols.`);

const unusedExports = [];

allExports.forEach((exp, index) => {
    // Grep command to find usage
    const command = `grep -r "${exp.name}" ${PROJECT_ROOT} --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=dist --exclude-dir=build --exclude-dir=coverage`;

    try {
        const result = execSync(command).toString().trim();
        const lines = result.split('\n').filter(line => line.trim() !== '');

        // Filter out the definition file itself
        const externalUsages = lines.filter(line => !line.startsWith(exp.file));
        const count = externalUsages.length;

        if (count === 0) {
            unusedExports.push(exp);
            process.stdout.write('.');
        }
    } catch (e) {
        console.error(`Error checking ${exp.name}: ${e.message}`);
    }
});

console.log('\n\nPossible Unused Exports:');
unusedExports.forEach(e => {
    console.log(`[${e.type}] ${e.name} in ${e.file}`);
});
