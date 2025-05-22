require('dotenv').config();
const { MongoClient } = require('mongodb');

// Optional: Validate the env variable
if (!process.env.LOCAL_URI) {
  throw new Error("Missing STAGE_URI in environment variables.");
}

const client = new MongoClient(process.env.LOCAL_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = client;
