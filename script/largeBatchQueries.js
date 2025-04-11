const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    const db = client.db(`${process.env.DATABASE}`);

    const profilerData = await db.collection('system.profile')
      .find({
        nreturned: { $gt: 100 },
        op: { $in: ['query', 'getmore'] }
      })
      .sort({ ts: -1 })
      .limit(20)
      .toArray();

    console.log("Queries returning more than 100 documents:", profilerData.length);
    profilerData.forEach(op => {
      console.log(`\nTime: ${op.ts}`);
      console.log(`Collection: ${op.ns}`);
      console.log(`Returned: ${op.nreturned} docs`);
      console.log(`Query/Command:`, op.query || op.command);
      console.log(`Execution Time: ${op.millis} ms`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
})();
