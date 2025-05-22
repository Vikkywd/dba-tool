const amqp = require('amqplib');

const connectURL = 'amqps://esstrisy:fgSDqs5Z87QMdOgCTQGzm6qF-kABs5EI@leopard.lmq.cloudamqp.com/esstrisy';

const send = async () => {
  const connection = await amqp.connect(connectURL);
  const channel = await connection.createChannel();

  const queue = 'my-queue';
  const message = 'Hello from Node.js to the cloud! 🚀';

  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(message));

  console.log("✅ Sent:", message);

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);
};

send().catch(console.error);
