// scripts/unusedIndexes.js
const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    const db = client.db(`${process.env.DATABASE}`);
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      const stats = await db.command({ collStats: col.name, indexDetails: true });
      console.log(`\nCollection: ${col.name}`);
      for (const [indexName, details] of Object.entries(stats.indexDetails)) {
        console.log(`  Index: ${indexName}, Accesses: ${JSON.stringify(details.accesses)}`);
      }
    }
  } finally {
    await client.close();
  }
})();
