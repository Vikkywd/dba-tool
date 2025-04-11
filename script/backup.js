const { exec } = require('child_process');

exec('mongodump --uri="mongodb://localhost:27017" --out=./backup', (error, stdout, stderr) => {
  if (error) {
    console.error(`Backup Error: ${error.message}`);
    return;
  }
  console.log(`Backup Success: ${stdout}`);
});
