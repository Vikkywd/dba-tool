const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    const db = client.db(`${process.env.DATABASE}`);
    const collection = db.collection('yourCollection');

    const result = await collection.aggregate([
      { $project: { keys: { $objectToArray: "$$ROOT" } } },
      { $unwind: "$keys" },
      { $group: { _id: "$keys.k", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log("Field Usage Stats:", result);
  } finally {
    await client.close();
  }
})();
