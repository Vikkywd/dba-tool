// testConnection.js

const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    // You can run a test query here if needed
    const db = client.db(); // default DB from URI
    const collections = await db.listCollections().toArray();
    console.log("📦 Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  } finally {
    await client.close();
  }
})();
