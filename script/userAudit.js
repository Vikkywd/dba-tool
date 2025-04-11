const client = require('../config/db');

(async () => {
  try {
    await client.connect();
    const db = client.db('admin');
    const users = await db.command({ usersInfo: 1 });
    console.log("Users:", users.users);
  } finally {
    await client.close();
  }
})();
