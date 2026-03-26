const { createTables } = require('../config/initDb');

async function runMigration() {
    console.log('🚀 Starting database migration...');
    try {
        await createTables();
        console.log('✨ Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('💥 Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
