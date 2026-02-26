import { execSync } from 'child_process';

try {
    const msg = process.argv[2] || 'Initial commit';
    console.log(`Committing with message: ${msg}`);
    // Use cmd /c for stability
    execSync(`cmd /c git commit -m "${msg}"`);
    console.log('Commit successful!');
} catch (e) {
    console.error('Commit failed:', e.message);
    if (e.stdout) console.log('STDOUT:', e.stdout.toString());
    if (e.stderr) console.log('STDERR:', e.stderr.toString());
}
