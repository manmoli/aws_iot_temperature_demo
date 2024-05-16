# IoT with AWS

## Step 1: Setting Up AWS IoT Core
1. Log in to the AWS Management Console and navigate to the AWS IoT Core service.
2. Create a Policy:
   - Go to **Secure > Policies** and click **Create**.
   - Name your policy (e.g., `MyIoTDevicePolicy`).
   - Add a policy statement that allows your device to connect, publish, subscribe, and receive messages. Example in
   - Click **Create** to create the policy.

## Step 2: Registering Your Device
1. Register a Thing:
   - Go to **Manage > Things** and click **Create**.
   - Choose **Create a single thing** and provide a name for your device (e.g., `MyIoTDevice`).
   - Follow the prompts to create a thing type and attach it to your device if needed.
   - Click **Next** to proceed.
2. Add a Certificate:
   - In the **Certificates** step, choose **Auto generate certificate**.
   - AWS IoT Core will generate a certificate and key pair for you.
   - Attach the policy you created earlier (e.g., `IoTPolicy`).
   - Click **Create Thing**.
   - Download the public certificate, private key, and root CA certificate.
   - Click on **done**, and the Thing will be activated.

## Step 3: Download and Secure Your Certificate
- Securely store the downloaded certificates and keys as you will need them to authenticate the device.
- Ensure you follow best practices for managing these credentials, such as not hardcoding them in your code.

## Step 4: Simulating a Device in Node.js
To simulate an IoT device that publishes data to AWS IoT Core using MQTT, you’ll need to set up a Node.js project and use the `aws-iot-device-sdk`.

1. Create a TypeScript project.
2. Install dependencies: in `device_simulator` directory run `npm i`.
3. Create an `.env` file with the path of the `private.pem.key` file, `certificate.pem.crt` file `CA.pem` file, and the host. The host is the endpoint in **AWS IoT Core > Settings > Device Data Endpoint > Endpoint**.

## Step 5: Run the Simulation
1. Compile the TypeScript code: `npx tsc deviceSimulator.ts`
2. Go to **AWS IoT > Manage > Things > IoTDevice** (the name of your simulated device) > **Activity > MQTT test client**.
3. Subscribe to the topic `device/temperature`.
4. Watch the messages.

## Step 6: Create a DynamoDB Table
1. Go to the DynamoDB service in the AWS Management Console.
2. Click **Create Table**.
3. Enter a Table name, such as `TemperatureData`.
4. Set a Partition key to `deviceId` (string) and, optionally, a Sort key to `timestamp` (number) to organize data by device and time.
5. Click **Create**.

## Step 7: Create Lambda Function IAM Role
1. Go to **IAM > Roles > LambdaDynamo > Create role**.
2. Select **AWS service**.
3. Select **Use case: Lambda**.
4. Select permission policies:
   - `AmazonDynamoDBFullAccess`
   - `AWSLambdaBasicExecutionRole`
5. Add name (`LambdaDynamoRole`).

## Step 8: Create the Lambda Function
1. Go to **Lambda > Functions > Create function**.
2. Author from scratch.
3. Add name (`IoTDataProcess`).
4. Select **Node.js 16.x** (this is because AWS libraries are loaded by default).
5. In **Change default execution role**, select **use an existing role**.
6. Select the role previously created (`LambdaDynamoRole`).
7. Create the function.
8. Add the Lambda code to the project.
9. Click on **deploy**.

## Step 9: Create the Rule that Includes DynamoDB Operations
1. Create the rule in **AWS IoT > Message Routing > Rules**.
2. Add the SQL statement to get the topic of the message: `SELECT * FROM 'device/temperature'`.
3. In **Attach rule action > Lambda** (send a message to a lambda function).
4. Select the lambda function (`IoTDataProcess`).
5. Create.

## Step 10: Add a Trigger to the Lambda Function
1. Go to **Lambda > Add Trigger**.
2. Select **AWS IoT** as a source.
3. Select **Custom rule**.
4. Select the rule you created earlier (`GetIoTTopicData`).

## Step 11: Test the Application
1. In the `aws_iot_temperature_demo/device_simulator` directory, run `ts-node device_simulator.ts`.
2. Watch the new entries in **DynamoDB > Explore items > TemperatureData**.
