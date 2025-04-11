const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    const adminDb = client.db('admin');
    const slowOps = await adminDb.command({ currentOp: 1, slowms: { $gt: 100 } });
    console.log("Slow Queries:", slowOps);
  } finally {
    await client.close();
  }
})();
