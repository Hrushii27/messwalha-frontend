console.log('--- ENV CHECK ---');
Object.keys(process.env).forEach(key => {
    if (key.includes('FIREBASE') || key.includes('GOOGLE')) {
        console.log(`${key}: ${process.env[key] ? 'FOUND (Length: ' + process.env[key]?.length + ')' : 'MISSING'}`);
    }
});
console.log('--- END ENV CHECK ---');
