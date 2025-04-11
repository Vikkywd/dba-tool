const fs = require('fs');
const readline = require('readline');
const path = require('path');

const filePath = path.join(__dirname, 'mongo.log');

const INPUT_FILE = filePath; 
const OUTPUT_DIR = 'split_csvs';
const MIN_SIZE_MB = 10;
const MAX_SIZE_MB = 30;
const BYTES_IN_MB = 1024 * 1024;

let fileIndex = 1;
let bytesWritten = 0;
let writer = null;
let header = '';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

const rl = readline.createInterface({
  input: fs.createReadStream(INPUT_FILE),
  crlfDelay: Infinity
});

async function startSplitting() {
  for await (const line of rl) {
    // Handle header separately
    if (!header) {
      header = line + '\n';
      createNewFile(); // Initialize first file
      continue;
    }

    // If writing this line exceeds MAX_SIZE_MB, start a new file
    const estimatedLineSize = Buffer.byteLength(line + '\n');
    if (bytesWritten + estimatedLineSize > MAX_SIZE_MB * BYTES_IN_MB) {
      writer.end();
      fileIndex++;
      createNewFile();
    }

    // Write line
    writer.write(line + '\n');
    bytesWritten += estimatedLineSize;
  }

  if (writer) writer.end();
  console.log(`✅ Done splitting. Files saved in ./${OUTPUT_DIR}`);
}

function createNewFile() {
  const filename = path.join(OUTPUT_DIR, `part_${fileIndex}.csv`);
  writer = fs.createWriteStream(filename);
  writer.write(header);
  bytesWritten = Buffer.byteLength(header);
}

startSplitting().catch(console.error);
