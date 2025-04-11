// scripts/collectionIndexSizes.js
const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    const db = client.db(`${process.env.DATABASE}`);
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      const stats = await db.collection(col.name).stats();
      console.log(`Collection: ${col.name}`);
      console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Indexes: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    }
  } finally {
    await client.close();
  }
})();
