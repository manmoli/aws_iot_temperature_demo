# IoT with AWS

## Step 1: Setting Up AWS IoT Core

1. Log in to the AWS Management Console and navigate to the AWS IoT Core service.
2. **Create a Policy:**
    - Go to `Secure > Policies` and click `Create`.
    - Name your policy (e.g., `MyIoTDevicePolicy`).
    - Add a policy statement that allows your device to connect, publish, subscribe, and receive messages.
    - Click `Create` to create the policy.

## Step 2: Registering Your Device

1. **Register a Thing:**
    - Go to `Manage > Things` and click `Create`.
    - Choose `Create a single thing` and provide a name for your device (e.g., `MyIoTDevice`).
    - Follow the prompts to create a thing type and attach it to your device if needed.
    - Click `Next` to proceed.
2. **Add a Certificate:**
    - In the Certificates step, choose `Auto generate certificate`.
    - AWS IoT Core will generate a certificate and key pair for you.
    - Attach the policy you created earlier (e.g., `IoTPolicy`).
    - Click `Create Thing`.
    - Download the public certificate, private key, and root CA certificate.
    - Click `Done`, and the Thing will be activated.

## Step 3: Download and Secure Your Certificate

- Securely store the downloaded certificates and keys as you will need them to authenticate the device.
- Ensure you follow best practices for managing these credentials, such as not hardcoding them in your code.

## Step 4: Simulating a Device in Node.js

1. To simulate an IoT device that publishes data to AWS IoT Core using MQTT, you’ll need to set up a Node.js project and use the aws-iot-device-sdk.
2. Create a TypeScript project.
3. Install dependencies: in the `device_simulator` directory run `npm i`.
4. Create an `.env` file with the path of the `private.pem.key` file, `certificate.pem.crt` file, `CA.pem` file, and the host. The host is the endpoint in `AWS IoT Core > Settings > Device Data Endpoint > Endpoint`.

## Step 5: Run the Simulation

1. Run `npx tsc deviceSimulator.ts`.
2. Go to `AWS IoT > Manage > Things > IoTDevice` (the name of your simulated device) > `Activity > MQTT test client`.
3. Subscribe to the topic `device/temperature`.
4. Watch the messages.

## Step 6: Create a DynamoDB Table

1. Go to the DynamoDB service in the AWS Management Console.
2. Click `Create Table`.
3. Enter a Table name, such as `TemperatureData`.
4. Set a Partition key to `deviceId` (string) and, optionally, a Sort key to `timestamp` (number) to organize data by device and time.
5. Click `Create`.

## Step 7: Create Lambda Function IAM Role

1. Go to `IAM > Roles > LambdaDynamo > Create role`.
2. Select `AWS service`.
3. Select `Use case: Lambda`.
4. Select permission policy:
    - `AmazonDynamoDBFullAccess`
    - `AWSLambdaBasicExecutionRole`
    - `AmazonSNSFullAccess`
5. Add name (`LambdaDynamoRole`).

## Step 8: Create the Lambda Function

1. Go to `Lambda > Functions > Create function`.
2. Author from scratch.
3. Add name (`IoTDataProcess`).
4. Select `Node.js 16.x` (this is because AWS libraries are loaded by default).
5. In `Change default execution role`, select “use an existing role”.
6. Select the role previously created (`LambdaDynamoRole`).
7. Create the function.
8. Add the Lambda code to the project.
9. Click on deploy.

## Step 9: Create the Rule That Includes DynamoDB Operations

1. Create the rule in `AWS IoT > Message Routing > Rules`.
2. Add the SQL statement to get the topic of the message `SELECT * FROM 'device/temperature'`.
3. In `Attach rule action` > `Lambda` (send a message to a lambda function).
4. Select the lambda function (`IoTDataProcess`).
5. Create.

## Step 10: Add a Trigger to the Lambda Function

1. Go to `Lambda > Add Trigger`.
2. Select `AWS IoT` as a source.
3. Custom rule.
4. Select the rule you created earlier (`GetIoTTopicData`).

## Step 11: Set Up Amazon SNS

1. **Create an SNS Topic:**
    - Go to the SNS dashboard in the AWS Management Console.
    - Click `Create topic`.
    - Choose a name and display name for your topic, e.g., `IoTNotificationTopic`.
    - Click `Create topic`.
2. **Subscribe to the SNS Topic for Email Notifications:**
    - On your topic's details page, click `Create subscription`.
    - Select `Email` as the protocol and enter your email address.
    - Click `Create subscription`.
    - You will receive an email to confirm the subscription. Confirm it to activate the subscription.

## Step 12: Set Up Amazon SQS

1. **Create an SQS Queue:**
    - Go to the SQS dashboard in the AWS Management Console.
    - Click `Create queue`.
    - Select `Standard Queue` and name it, e.g., `IoTProcessQueue`.
    - Click `Quick-Create Queue`.
2. **Subscribe SQS to SNS Topic:**
    - Go to `Amazon SQS > Queues > IoTProcessQueue`.
    - `SNS subscriptions > Subscribe to Amazon SNS topic`.
    - Subscribe to the SNS created in step 11 (`IoTNotificationTopic`).

## Step 13: Set Up EC2 Instance with Node.js Application

1. **Create an IAM Role for the EC2 Instance:**
    - Go to `IAM > Roles > Create Role`.
    - Trusted entity type > AWS Service.
    - User Case > EC2.
    - Permissions policies > `AmazonSQSFullAccess`.
    - Add the name `EC2SqsTest`.
    - Create role.
2. **Launch an EC2 Instance:**
    - Choose an Amazon Machine Image (AMI) that supports Node.js (Linux).
    - Create a new key pair for login (RSA, .pem).
    - Ensure your instance’s security group allows HTTP/HTTPS traffic for web access.
    - Connect to the instance via ssh (follow instructions in the connect section of the EC2 instance page).
    - Install nvm and Node.js:
        ```sh
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
        source ~/.bashrc
        nvm install --lts
        ```
    - Verify the installation with: 
        ```sh
        node -e "console.log('Running Node.js ' + process.version)"
        ```
3. **Create a Simple Node.js Application:**
    - Inside the EC2 Instance, clone the project:
        ```sh
        git clone https://github.com/manmoli/aws_iot_temperature_demo.git
        ```
    - Go to the `ec2_microservice` directory.
    - In the terminal put: `npm i`
    - Then: `node index.js`

## Step 14: Testing and Deployment

- Test the entire flow by simulating data from your IoT device and ensure that:
    - Lambda processes and logs data.
    - Lambda publishes to SNS, triggering an email and sending a message to SQS.
    - Your EC2 application receives messages from SQS.
