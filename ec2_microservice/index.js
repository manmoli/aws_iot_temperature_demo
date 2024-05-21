const AWS = require('aws-sdk');
const SQS = new AWS.SQS({ region: 'us-east-1' }); // Update your region
const queueURL = '<SQS URL here>';

const receiveMessage = async () => {
  const params = {
    QueueUrl: queueURL,
    MaxNumberOfMessages: 1
  };

  try {
    const data = await SQS.receiveMessage(params).promise();
    console.log('looking for new data: ', data);
    if (data.Messages.length > 0) {

      console.log('Received message:', data);
      // Further processing or response logic here

      // Delete message after processing
      const deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };
      await SQS.deleteMessage(deleteParams).promise();
      console.log('Message deleted');
    }
  } catch (err) {
    console.error('Error receiving SQS message:', err);
  }
};

const interval = setInterval(receiveMessage, 5000); // Check for new messages every 5 seconds

function cleanup () {
	clearInterval(interval);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
