const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    const db = client.db('config');
    const shards = await db.collection('shards').find().toArray();
    console.log("Shards Info:", shards);
  } finally {
    await client.close();
  }
})();
