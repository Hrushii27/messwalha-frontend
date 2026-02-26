import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        const skipDirs = ['node_modules', '.git', 'dist', 'build', '.firebase', 'playwright-report', 'test-results', 'coverage'];
        if (isDirectory && !skipDirs.includes(f)) {
            walk(dirPath, callback);
        } else if (!isDirectory) {
            callback(path.join(dir, f));
        }
    });
}

const root = process.argv[2] || '.';
console.log(`Adding files from ${root}...`);

walk(root, (filePath) => {
    try {
        // Use cmd /c for stability
        execSync(`cmd /c git add "${filePath}"`);
        console.log(`Added: ${filePath}`);
    } catch (e) {
        console.error(`Failed to add: ${filePath}`, e.message);
    }
});
