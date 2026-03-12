const db = require('./server/config/db');

async function check() {
    try {
        const res = await db.query('SELECT COUNT(*) FROM mess_listings');
        console.log('--- DATABASE CHECK ---');
        console.log('MESS_LISTINGS COUNT:', res.rows[0].count);
        
        const activeRes = await db.query('SELECT COUNT(*) FROM mess_listings WHERE is_active = TRUE');
        console.log('ACTIVE MESS_LISTINGS COUNT:', activeRes.rows[0].count);

        const all = await db.query('SELECT id, name, is_active FROM mess_listings LIMIT 5');
        console.log('SAMPLES:', JSON.stringify(all.rows, null, 2));
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        process.exit();
    }
}

check();
