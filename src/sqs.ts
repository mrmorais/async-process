import { SQS, AWSError } from "aws-sdk";

type SQSCallback = (err: AWSError, data: SQS.ReceiveMessageResult) => void;

export class SQSService {
  private static instance: SQSService;
  public sqs: SQS;

  private constructor() {
    this.sqs = new SQS({
      hostPrefixEnabled: false,
      endpoint: "http://sqs:9324",
      endpointDiscoveryEnabled: false,
      apiVersion: "2012-11-05",
      region: "us-east-1",
      credentials: {
        accessKeyId: "key",
        secretAccessKey: "secret",
        sessionToken: "token",
      },
    });
  }

  public static getService(): SQSService {
    if (!SQSService.instance) {
      SQSService.instance = new SQSService();
    }

    return SQSService.instance;
  }

  private async createQueueIfNeeded(): Promise<void> {
    const queues: SQS.ListQueuesResult = await this.sqs.listQueues().promise();
    if (!queues.QueueUrls) {
      const queueParams: SQS.CreateQueueRequest = {
        QueueName: "PROCESSING_QUEUE",
      };

      await this.sqs.createQueue(queueParams).promise();
    }
  }

  async getQueueUrl(queueName: string): Promise<string | undefined> {
    const queueUrl = await this.sqs
      .getQueueUrl({
        QueueName: queueName,
      })
      .promise();

    return queueUrl.QueueUrl;
  }

  async sendMessage(queueName: string, messageBody: any): Promise<void> {
    const queueUrl = await this.getQueueUrl(queueName);

    if (!queueUrl)
      throw new Error(`Queue URL not found for QueueName = ${queueName}`);

    const messageParams: SQS.SendMessageRequest = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
    };

    await this.sqs.sendMessage(messageParams).promise();
  }

  async receiveMessage(
    queueName: string,
    callbackFunction: SQSCallback
  ): Promise<void> {
    const queueUrl = await this.getQueueUrl(queueName);

    if (!queueUrl)
      throw new Error(`Queue URL not found for QueueName = ${queueName}`);

    const queueParams = {
      QueueUrl: queueUrl,
    };

    this.sqs.receiveMessage(queueParams, callbackFunction);
  }
}
