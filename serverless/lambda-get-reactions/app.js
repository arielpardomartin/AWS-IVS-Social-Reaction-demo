const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

const { TABLE_NAME } = process.env;

exports.handler = async (event) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'channelArnIndex',
      KeyConditionExpression: 'channelArn = :c',
      ExpressionAttributeValues: {
        ':c': event.queryStringParameters.channelArn,
      },
      Limit: event.queryStringParameters.limit,
    };
    const reactionsList = await ddb.query(params).promise();

    return { statusCode: 200, body: JSON.stringify(reactionsList.Items) };
  } catch (error) {
    return { statusCode: 500, body: error };
  }
};
