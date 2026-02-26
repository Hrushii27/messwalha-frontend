import { execSync } from 'child_process';

function run(cmd) {
    console.log(`Running: ${cmd}`);
    try {
        const out = execSync(`cmd /c ${cmd}`);
        console.log(out.toString());
    } catch (e) {
        console.error(`Failed: ${e.message}`);
        if (e.stdout) console.log('STDOUT:', e.stdout.toString());
        if (e.stderr) console.log('STDERR:', e.stderr.toString());
    }
}

// 1. Rename branch to main
run('git branch -M main');

// 2. Add remote origin (if not set)
const url = process.argv[2];
if (url) {
    run(`git remote remove origin`);
    run(`git remote add origin "${url}"`);
}

// 3. Push
run('git push -u origin main');
