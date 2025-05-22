const amqp = require('amqplib');

const connectURL = 'amqps://esstrisy:fgSDqs5Z87QMdOgCTQGzm6qF-kABs5EI@leopard.lmq.cloudamqp.com/esstrisy';

const receive = async () => {
  const connection = await amqp.connect(connectURL);
  const channel = await connection.createChannel();

  const queue = 'my-queue';

  await channel.assertQueue(queue, { durable: false });

  console.log(`👂 Waiting for messages in "${queue}"...`);

  channel.consume(queue, (msg) => {
    console.log("📥 Received:", msg.content.toString());
  }, {
    noAck: true
  });
};

receive().catch(console.error);
