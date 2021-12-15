const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

const { TABLE_NAME, GATEWAY_DOMAIN } = process.env;

exports.handler = async (event) => {
  console.info('Incoming event:\n', JSON.stringify(event));

  let connectionData;
  const payload = event.Records;
  const messagesToSend = payload.map((record) => JSON.parse(record.body).Message);

  try {
    const params = {
      TableName: TABLE_NAME,
    };
    console.log('Querying DynamoDB with params:\n', params);
    connectionData = await ddb.scan(params).promise();
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: GATEWAY_DOMAIN,
  });

  const postCalls = connectionData.Items.map(async ({ connectionId }) => {
    try {
      const params = {
        ConnectionId: connectionId,
        Data: JSON.stringify(messagesToSend),
      };
      console.log('Posting to WS with params:\n', params);
      await apigwManagementApi.postToConnection(params).promise();
    } catch (err) {
      if (err.statusCode === 410) {
        console.log(`Found stale connection, deleting "${connectionId}" from table "${TABLE_NAME}"`);
        await ddb.delete({ TableName: TABLE_NAME, Key: { connectionId } }).promise();
      } else {
        throw err;
      }
    }
  });

  try {
    await Promise.all(postCalls.flat());
  } catch (err) {
    return { statusCode: 500, body: err.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};
