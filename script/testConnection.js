// testConnection.js

const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log("📦 Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  } finally {
    await client.close();
  }
})();

