const db = require('./config/db');

async function check() {
    try {
        const result = {};
        const tables = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        result.tables = tables.rows.map(r => r.table_name);

        for (const table of ['reviews', 'notifications', 'mess_listings', 'mess_owners']) {
            const columns = await db.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
            `);
            result[table] = columns.rows;
        }
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
