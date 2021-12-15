const { SQS, IVS } = require('aws-sdk');
const {
  AMOUNT_OF_EXTRACTIONS_PER_QUEUE,
  MAX_MESSAGES_TO_EXTRACT_FROM_QUEUE,
  REACTION_MESSAGE_EXPECTED_LENGTH,
  TIMED_METADATA_MAXIMUM_LENGTH,
} = require('./constants');

const sqs = new SQS({
  apiVersion: '2012-11-05',
  region: process.env.REGION,
});

const ivs = new IVS({
  apiVersion: '2020-07-14',
  region: process.env.REGION,
});

const timedMetadataProcess = async () => {
  const time = new Date().getTime(); // used only to identify each process

  try {
    console.time(`${time} - Timed Metadata Process`);

    const sqsRetrieveRequests = [];
    const sqsQueuesToExtractMessages = [];

    for (let i = 0; i < AMOUNT_OF_EXTRACTIONS_PER_QUEUE; i++) {
      const sqsParams = {
        QueueUrl: process.env.SQS_DEAD_LETTER_QUEUE_URL,
        MaxNumberOfMessages: MAX_MESSAGES_TO_EXTRACT_FROM_QUEUE,
      };
      sqsRetrieveRequests.push(sqs.receiveMessage(sqsParams).promise());
      sqsQueuesToExtractMessages.push(process.env.SQS_DEAD_LETTER_QUEUE_URL);
    }

    for (let i = 0; i < AMOUNT_OF_EXTRACTIONS_PER_QUEUE; i++) {
      const sqsParams = {
        QueueUrl: process.env.SQS_QUEUE_URL,
        MaxNumberOfMessages: MAX_MESSAGES_TO_EXTRACT_FROM_QUEUE,
      };
      sqsRetrieveRequests.push(sqs.receiveMessage(sqsParams).promise());
      sqsQueuesToExtractMessages.push(process.env.SQS_QUEUE_URL);
    }

    const queueData = await Promise.allSettled(sqsRetrieveRequests);
    console.log(`${time} - queueData: `, JSON.stringify(queueData));

    const channelMessagesCounters = {};
    const putMetadataParams = {};
    const putMetadataRequests = [];
    const deleteMessageRequests = [];

    for (let [index, messageBatch] of queueData.entries()) {
      if (messageBatch.status === 'rejected') {
        console.log(`${time} - Rejected message batch. Error: `, messageBatch.reason.message);
        continue;
      }
      if (!messageBatch.value.Messages) continue;

      for (let queueMessage of messageBatch.value.Messages) {
        const { x, y, senderId, type, channelArn } = JSON.parse(JSON.parse(queueMessage.Body).Message);

        if (
          channelMessagesCounters[channelArn] &&
          channelMessagesCounters[channelArn] == Math.floor(TIMED_METADATA_MAXIMUM_LENGTH / REACTION_MESSAGE_EXPECTED_LENGTH)
        )
          continue;

        if (!channelMessagesCounters[channelArn]) {
          channelMessagesCounters[channelArn] = 0;
        }
        channelMessagesCounters[channelArn] += 1;

        if (!putMetadataParams[channelArn]) {
          putMetadataParams[channelArn] = {
            channelArn,
            metadata: [],
          };
        }
        putMetadataParams[channelArn].metadata.push(`${x},${y},${senderId},${type}`);

        const mainQueueDeleteMessageParams = {
          QueueUrl: sqsQueuesToExtractMessages[index],
          ReceiptHandle: queueMessage.ReceiptHandle,
        };
        deleteMessageRequests.push(sqs.deleteMessage(mainQueueDeleteMessageParams).promise());
      }
    }
    console.log(`${time} - putMetadataParams: `, putMetadataParams);
    if (Object.keys(putMetadataParams).length === 0) return;

    for (let arn of Object.keys(putMetadataParams)) {
      putMetadataParams[arn].metadata = JSON.stringify(putMetadataParams[arn].metadata);

      putMetadataRequests.push(ivs.putMetadata(putMetadataParams[arn]).promise());
    }
    await Promise.allSettled(putMetadataRequests);
    await Promise.allSettled(deleteMessageRequests);

    console.timeEnd(`${time} - Timed Metadata Process`);
    return;
  } catch (error) {
    console.log(`${time} - Timed Metadata Process error: `, error);
    console.timeEnd(`${time} - Timed Metadata Process`);
    return;
  }
};

const timedMetadataLoop = async () => {
  do {
    console.log('Starting iteration...');
    await timedMetadataProcess();
    console.log('Exiting from iteration...');
  } while (true);
};

timedMetadataLoop();
