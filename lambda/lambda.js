const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
  console.log('Received IoT data: ', event);
  
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
