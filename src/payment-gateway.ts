import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";
import { v4 as uuid } from "uuid";
import { createApolloServer } from "./apollo";
import { typeDefs } from "./schema";
import { SQSService } from "./sqs";
import { PaymentProcess, PaymentStatus } from "./types";

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

const resolvers = {
  Mutation: {
    createPayment() {
      const processId = uuid();

      const payment: PaymentProcess = {
        id: processId,
        status: PaymentStatus.CREATED,
      };

      return payment;
    },
    async initiatePayment(_: any, args: any) {
      const payment: PaymentProcess = {
        id: args.id,
        status: PaymentStatus.INITIADED,
      };

      const sqs = SQSService.getService();
      sqs.sendMessage("PROCESSING_QUEUE", payment);

      return payment;
    },
  },
  Subscription: {
    paymentProcessed: {
      subscribe: (_: any, args: any) =>
        redisPubSub.asyncIterator([`PAYMENT_PROCESSED.${args.id}`]),
    },
  },
};

const startPaymentGateway = async ({ typeDefs, resolvers }: any) => {
  const gqlServer = await createApolloServer({ typeDefs, resolvers });

  const port = 4000;
  gqlServer.listen(port, () => {
    console.log(`Server is now running on http://localhost:${port}/graphql`);
  });
};

startPaymentGateway({ typeDefs, resolvers });
