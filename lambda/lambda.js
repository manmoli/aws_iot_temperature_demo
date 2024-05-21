const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const sns = new AWS.SNS();

const publishToSNS = async (message) => {
  const params = {
    Message: message,
    TopicArn: '<Your-SNS-Topic-ARN>'
  };

  try {
    await sns.publish(params).promise();
    console.log('Message published to SNS');
  } catch (err) {
    console.error('Error publishing to SNS:', err);
  }
};


exports.handler = async (event) => {
  try {
    console.log('Received IoT data: ', event);

    if (event.temperature > 27) {
      publishToSNS(`temperature is higher than normal: ${27}`);
    }

    const params = {
      TableName: 'TemperatureData',
      Item: {
        deviceId: event.deviceId,
        timestamp: new Date().getTime(),
        temperature: event.temperature
      }
    };

    return dynamoDB.put(params).promise();
  } catch (error) {
    console.error('Error storing data in DynamoDB: ', error);
    throw error;
  }
};
