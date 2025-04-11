const fs = require('fs');
const readline = require('readline');
const path = require('path');

const filePath = path.join(__dirname, 'mongo.log');
const OUTPUT_DIR = 'slow_query_log_csvs';
const BYTES_IN_MB = 1024 * 1024;
const MIN_SIZE_MB = 10;
const MAX_SIZE_MB = 30;
const SLOW_QUERY_THRESHOLD_MS = 100;

if (!fs.existsSync(filePath)) {
  console.error('❌ Log file not found at:', filePath);
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

async function analyzeLogFile() {
  const authSuccess = [];
  const authFail = [];
  const mechanisms = {};
  const failureReasons = {};
  const ipActivity = {};
  const driverVersions = {};
  const rawEvents = [];
  const slowQueries = [];

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

    // Collect raw events
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

    if (msg === 'Slow query' && attr?.durationMillis >= SLOW_QUERY_THRESHOLD_MS) {
      slowQueries.push({
        timestamp,
        namespace: attr.ns || '',
        millis: attr.durationMillis || '',
        remote: ip,
        command: attr.command ? JSON.stringify(attr.command) : '',
      });
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

  // Write full log summary CSV
  const rawHeader = '\n\nTimestamp,Context,Message,IP,Mechanism,Error';
  const rawLines = rawEvents.map((evt) =>
    [
      evt.timestamp,
      evt.context,
      evt.message,
      evt.ip,
      evt.mechanism,
      String(evt.error || '').replace(/"/g, '""'),
    ].map((v) => `"${v}"`).join(',')
  );
  const fullSummary = [...summaryLines, rawHeader, ...rawLines];

  await writeCSVChunks(fullSummary, 'log_summary');

  // Write slow queries
  const slowHeader = 'Timestamp,Namespace,Millis,Remote,Command';
  const slowLines = slowQueries.map((q) =>
    [
      q.timestamp,
      q.namespace,
      q.millis,
      q.remote,
      q.command.replace(/"/g, '""'),
    ].map((v) => `"${v}"`).join(',')
  );
  const fullSlowCSV = [slowHeader, ...slowLines];

  await writeCSVChunks(fullSlowCSV, 'slow_queries');

  console.log('✅ CSVs written and split into:', OUTPUT_DIR);
}

async function writeCSVChunks(lines, baseFilename) {
  let fileIndex = 1;
  let bytesWritten = 0;
  let writer = null;

  const openNewFile = () => {
    if (writer) writer.end();
    const outputPath = path.join(OUTPUT_DIR, `${baseFilename}_part${fileIndex}.csv`);
    writer = fs.createWriteStream(outputPath);
    bytesWritten = 0;
    fileIndex++;
    return outputPath;
  };

  openNewFile();

  for (const line of lines) {
    const lineSize = Buffer.byteLength(line + '\n');
    if (bytesWritten + lineSize > MAX_SIZE_MB * BYTES_IN_MB) {
      openNewFile();
    }
    writer.write(line + '\n');
    bytesWritten += lineSize;
  }

  if (writer) writer.end();
}

analyzeLogFile().catch(console.error);
