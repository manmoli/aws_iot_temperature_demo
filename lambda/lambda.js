const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Received IoT data: ', JSON.stringify(event));
  
  const promises = event.Records.map((record) => {
    const buffer = Buffer.from(record.kinesis.data, 'base64').toString('utf-8');
    console.log('Buffer data: ', buffer)
    const payload = JSON.parse(buffer);
    
    const params = {
      TableName: 'TemperatureData',
      Item: {
        deviceId: payload.deviceId,
        timestamp: new Date().getTime(),
        temperature: payload.temperature
      }
    };
    
    return dynamoDB.put(params).promise();
    
  })
  
  try {
    Promise.all(promises);
  } catch (error) {
    console.error('Error storing data in DynamoDB: ', error);
    throw error;
  }
};
