// scripts/findMissingIndexes.js
const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    const db = client.db(`${process.env.DATABASE}`);
    const collection = db.collection('yourCollection');

    //query
    const explain = await collection.find({ email: "test@example.com" }).explain("executionStats");

    const stage = explain.queryPlanner.winningPlan.inputStage || explain.queryPlanner.winningPlan;
    if (stage.stage === 'COLLSCAN') {
      console.warn('Warning: Collection scan detected. Consider indexing the field(s).');
    } else {
      console.log('Index is used:', stage);
    }
  } finally {
    await client.close();
  }
})();
