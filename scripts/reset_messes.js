const db = require('../server/config/db');

async function resetMesses() {
    try {
        console.log("🧹 Resetting mess data...");
        // TRUNCATE is better if we want to reset IDs too, but DELETE followed by restart sequence is safer if there are FKs.
        // Given existing FKs in reviews, favorites, etc., we should clear those too or use CASCADE.
        await db.query("TRUNCATE TABLE mess_listings CASCADE");
        console.log("✅ SUCCESS: messes table (mess_listings) reset.");
        process.exit(0);
    } catch (err) {
        console.error("❌ ERROR resetting messes:", err.message);
        process.exit(1);
    }
}

resetMesses();
