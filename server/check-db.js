const db = require('./config/db');

async function check() {
    try {
        const tables = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', tables.rows.map(r => r.table_name));

        for (const table of ['reviews', 'notifications']) {
            const columns = await db.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
            `);
            console.log(`Columns for ${table}:`, columns.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
