const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const sns = new AWS.SNS({
  apiVersion: '2010-03-31',
});

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

const { TABLE_NAME } = process.env;

exports.handler = async (event) => {
  console.info('Incoming event:\n', JSON.stringify(event));

  const payload = JSON.parse(event.body);

  try {
    const { x, y, type, senderId, channelArn } = payload;

    const dynamoDbParams = {
      TableName: TABLE_NAME,
      Item: {
        id: uuidv4(),
        channelArn,
        reaction: type,
      },
    };
    await ddb.put(dynamoDbParams).promise();

    const decimalsToLeave = 2;
    const roundedX = Math.round(x * Math.pow(10, decimalsToLeave)) / Math.pow(10, decimalsToLeave);
    const roundedY = Math.round(y * Math.pow(10, decimalsToLeave)) / Math.pow(10, decimalsToLeave);
    const reactionMessage = {
      x: roundedX,
      y: roundedY,
      type,
      senderId: senderId.slice(0, 8),
      channelArn,
    };
    const snsParams = {
      Message: JSON.stringify(reactionMessage),
      TopicArn: process.env.TOPIC_ARN,
    };
    await sns.publish(snsParams).promise();
  } catch (error) {
    return { statusCode: 500, body: error };
  }

  return { statusCode: 200, body: 'Notification pushed' };
};
