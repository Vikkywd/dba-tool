const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    const db = client.db(`${process.env.DATABASE}`);
    const collection = db.collection('yourCollection');

    const sample = await collection.aggregate([{ $sample: { size: 10 } }]).toArray();
    console.log("Schema Sample:", sample);
  } finally {
    await client.close();
  }
})();
