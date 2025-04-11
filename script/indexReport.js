const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    const db = client.db(`${process.env.DATABASE}`);
    const collections = await db.listCollections().toArray();

    for (const col of collections) {
      const indexes = await db.collection(col.name).indexInformation();
      console.log(`Indexes for ${col.name}:`, indexes);
    }
  } finally {
    await client.close();
  }
})();
