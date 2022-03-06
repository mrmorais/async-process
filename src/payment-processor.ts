import { Consumer } from "sqs-consumer";
import { SQS } from "aws-sdk";
import Redis from "ioredis";
import { SQSService } from "./sqs";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { PaymentStatus } from "./types";

const redisConnection = new Redis({
  host: "redis",
  port: 6379,
  family: 4,
  db: 0,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
});

const redisPubSub = new RedisPubSub({
  subscriber: redisConnection,
  publisher: redisConnection,
  connection: {
    host: "redis",
  },
});

const startPaymentProcessor = async () => {
  const sqsService: SQSService = SQSService.getService();
  const queueUrl = await sqsService.getQueueUrl("PROCESSING_QUEUE");

  const consumer = Consumer.create({
    queueUrl,
    sqs: sqsService.sqs,
    async handleMessage(message: SQS.Message) {
      const timeToSleep = Math.floor(Math.random() * 10000);
      await new Promise((res) => setTimeout(res, timeToSleep));

      const paymentProcess = JSON.parse(message?.Body || "{}");

      const success = Math.random() > 0.5;

      redisPubSub.publish(`PAYMENT_PROCESSED.${paymentProcess.id}`, {
        paymentProcessed: {
          ...paymentProcess,
          status: success ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
          processedAt: new Date().toUTCString(),
        },
      });
    },
  });

  consumer.start();
};

startPaymentProcessor();
