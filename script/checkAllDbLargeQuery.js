const client = require('../config/db');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

(async () => {
  try {
    await client.connect();

    const adminDb = client.db().admin();
    const dbList = await adminDb.listDatabases();

    const allQueryData = [];

    for (const dbInfo of dbList.databases) {
      const dbName = dbInfo.name;

      if (['admin', 'config', 'local'].includes(dbName)) continue;

      const db = client.db(dbName);
      const profileCollectionExists = await db.listCollections({ name: 'system.profile' }).hasNext();

      if (!profileCollectionExists) {
        console.log(`⚠️  Profiling not enabled or no profile data in DB: ${dbName}`);
        continue;
      }

      const profilerData = await db.collection('system.profile')
        .find({
          nreturned: { $gt: 100 },
          op: { $in: ['query', 'getmore'] }
        })
        .sort({ ts: -1 })
        .limit(20)
        .toArray();

      if (profilerData.length > 0) {
        console.log(`\n=== 🔍 Database: ${dbName} ===`);
        profilerData.forEach(op => {
          const entry = {
            database: dbName,
            timestamp: op.ts,
            collection: op.ns,
            returned_docs: op.nreturned,
            query: JSON.stringify(op.query || op.command),
            execution_time_ms: op.millis
          };
          allQueryData.push(entry);

          // Also log to console
          console.log(`\nTime: ${entry.timestamp}`);
          console.log(`Collection: ${entry.collection}`);
          console.log(`Returned: ${entry.returned_docs} docs`);
          console.log(`Query/Command:`, entry.query);
          console.log(`Execution Time: ${entry.execution_time_ms} ms`);
        });
      } else {
        console.log(`✅ No large-result queries found in DB: ${dbName}`);
      }
    }

    // Write to CSV
    if (allQueryData.length > 0) {
      const outputPath = path.join(__dirname, 'large_queries_report.csv');
      const csvWriter = createCsvWriter({
        path: outputPath,
        header: [
          { id: 'database', title: 'Database' },
          { id: 'timestamp', title: 'Timestamp' },
          { id: 'collection', title: 'Collection' },
          { id: 'returned_docs', title: 'Returned Docs' },
          { id: 'query', title: 'Query / Command' },
          { id: 'execution_time_ms', title: 'Execution Time (ms)' }
        ]
      });

      await csvWriter.writeRecords(allQueryData);
      console.log(`\n📁 CSV Report generated at: ${outputPath}`);
    } else {
      console.log(`\n✅ No large-result queries found in any database.`);
    }

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
})();
