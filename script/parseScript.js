const fs = require('fs');
const readline = require('readline');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'mongo.log');
const TEMP_CSV = path.join(__dirname, 'log_summary.csv');
const OUTPUT_DIR = path.join(__dirname, 'split_csvs');
const MAX_SIZE_MB = 30;
const MIN_SIZE_MB = 10;
const BYTES_IN_MB = 1024 * 1024;

async function analyzeLogFile(filePath) {
  const authSuccess = [];
  const authFail = [];
  const mechanisms = {};
  const failureReasons = {};
  const ipActivity = {};
  const driverVersions = {};
  const rawEvents = [];

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (err) {
      continue;
    }

    const timestamp = entry.t?.$date || '';
    const msg = entry.msg || '';
    const ctx = entry.ctx || '';
    const attr = entry.attr || {};
    const ip = attr.remote?.split(':')[0] || '';
    const mechanism = attr.mechanism || '';
    const error = attr.error || '';
    const driver = attr.doc?.driver?.name;
    const driverVersion = attr.doc?.driver?.version;

    rawEvents.push({
      timestamp,
      context: ctx,
      message: msg,
      ip,
      mechanism,
      error,
    });

    if (ip) ipActivity[ip] = (ipActivity[ip] || 0) + 1;

    if (msg === 'Authentication succeeded') {
      authSuccess.push(attr);
      mechanisms[mechanism] = (mechanisms[mechanism] || 0) + 1;
    }

    if (msg === 'Authentication failed') {
      authFail.push(attr);
      failureReasons[error || 'Unknown'] = (failureReasons[error || 'Unknown'] || 0) + 1;
      mechanisms[mechanism] = (mechanisms[mechanism] || 0) + 1;
    }

    if (driver && driverVersion) {
      const key = `${driver} ${driverVersion}`;
      driverVersions[key] = (driverVersions[key] || 0) + 1;
    }
  }

  const summaryLines = [];
  summaryLines.push('Metric,Value');
  summaryLines.push(`Authentication Successes,${authSuccess.length}`);
  summaryLines.push(`Authentication Failures,${authFail.length}`);

  summaryLines.push('\nMechanism,Count');
  for (const [mech, count] of Object.entries(mechanisms)) {
    summaryLines.push(`${mech},${count}`);
  }

  summaryLines.push('\nFailure Reason,Count');
  for (const [reason, count] of Object.entries(failureReasons)) {
    summaryLines.push(`"${reason}",${count}`);
  }

  summaryLines.push('\nTop IPs,Requests');
  Object.entries(ipActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([ip, count]) => {
      summaryLines.push(`${ip},${count}`);
    });

  summaryLines.push('\nClient Drivers,Count');
  for (const [driver, count] of Object.entries(driverVersions)) {
    summaryLines.push(`${driver},${count}`);
  }

  const rawLines = [];
  rawLines.push('\n\nTimestamp,Context,Message,IP,Mechanism,Error');
  rawEvents.forEach((evt) => {
    const line = [
      evt.timestamp,
      evt.context,
      evt.message,
      evt.ip,
      evt.mechanism,
      String(evt.error || '').replace(/"/g, '""')
    ].map((v) => `"${v}"`).join(',');
    rawLines.push(line);
  });

  const csvOutput = [...summaryLines, ...rawLines].join('\n');
  fs.writeFileSync(TEMP_CSV, csvOutput);
  console.log('📄 Log parsed & CSV created.');
}

async function splitCSVFile(inputFilePath) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  let fileIndex = 1;
  let bytesWritten = 0;
  let writer = null;
  let header = '';
  const rl = readline.createInterface({
    input: fs.createReadStream(inputFilePath),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!header) {
      header = line + '\n';
      createNewFile();
      continue;
    }

    const estimatedLineSize = Buffer.byteLength(line + '\n');
    if (bytesWritten + estimatedLineSize > MAX_SIZE_MB * BYTES_IN_MB) {
      writer.end();
      fileIndex++;
      createNewFile();
    }

    writer.write(line + '\n');
    bytesWritten += estimatedLineSize;
  }

  if (writer) writer.end();
  console.log(`✅ CSV split complete. Files saved in ${OUTPUT_DIR}`);
  
  function createNewFile() {
    const filePath = path.join(OUTPUT_DIR, `part_${fileIndex}.csv`);
    writer = fs.createWriteStream(filePath);
    writer.write(header);
    bytesWritten = Buffer.byteLength(header);
  }
}

// MAIN EXECUTION
(async () => {
  if (!fs.existsSync(LOG_FILE)) {
    console.error('❌ Log file not found:', LOG_FILE);
    process.exit(1);
  }

  await analyzeLogFile(LOG_FILE);
  await splitCSVFile(TEMP_CSV);
})();
