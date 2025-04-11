const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    const db = client.db('Live_Practice_Business_Copy');
    const stats = await db.command({ dbStats: 1 });
    console.log("Database Stats:", stats);
  } finally {
    await client.close();
  }
})();
