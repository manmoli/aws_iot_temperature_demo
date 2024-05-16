import * as dotenv from 'dotenv'
dotenv.config()
import { mqtt5, iot } from 'aws-iot-device-sdk-v2'
import { ICrtError } from 'aws-crt'
import { once } from 'events'

interface DeviceConfig {
    keyPath: string,
    certPath: string,
    caPath: string,
    clientId: string,
    host: string
}

const iotDevice: DeviceConfig = {
    keyPath: `${process.env.KEY_PATH}`,
    certPath: `${process.env.CERT_PATH}`,
    caPath: `${process.env.CA_PATH}`,
    clientId: `${process.env.CLIENT_ID}`,
    host: `${process.env.HOST}`,
}

let client: mqtt5.Mqtt5Client | undefined = undefined;

function createClientConfig(config: DeviceConfig): mqtt5.Mqtt5ClientConfig {
    let builder: iot.AwsIotMqtt5ClientConfigBuilder =
        iot.AwsIotMqtt5ClientConfigBuilder
            .newDirectMqttBuilderWithMtlsFromPath(
                config.host,
                config.certPath,
                config.keyPath
            )

    builder.withConnectProperties({
        keepAliveIntervalSeconds: 1200
    })

    return builder.build()
}

function createClient(ioTConfig: DeviceConfig): mqtt5.Mqtt5Client {
    let config: mqtt5.Mqtt5ClientConfig = createClientConfig(ioTConfig)

    console.log('Creating client for ' + config.hostName)
    let client: mqtt5.Mqtt5Client = new mqtt5.Mqtt5Client(config)

    client.on('error', (error: ICrtError) => {
        console.log('******************************************************')
        console.log('Error event: ' + error.toString())
        console.log('******************************************************')
    })

    client.on('messageReceived', (eventData: mqtt5.MessageReceivedEvent): void => {
        console.log('******************************************************')
        console.log('Message received event: ' + JSON.stringify(eventData.message));
        console.log('******************************************************')
    })

    client.on('attemptingConnect', (eventData: mqtt5.AttemptingConnectEvent) => {
        console.log('******************************************************')
        console.log('attempting connect event');
        console.log('******************************************************')
    })

    client.on('connectionSuccess', (eventData: mqtt5.ConnectionSuccessEvent) => {
        console.log('******************************************************')
        console.log('Connection success event');
        console.log('Connack: ' + JSON.stringify(eventData.connack));
        console.log('Settings: ' + JSON.stringify(eventData.settings));
        console.log('******************************************************')

    });

    client.on('connectionFailure', (eventData: mqtt5.ConnectionFailureEvent) => {
        console.log('******************************************************')
        console.log("Connection failure event: " + eventData.error.toString());
        if (eventData.connack) {
            console.log("Connack: " + JSON.stringify(eventData.connack));
        }
        console.log('******************************************************')

    });

    client.on('disconnection', (eventData: mqtt5.DisconnectionEvent) => {
        console.log('******************************************************')
        console.log("Disconnection event: " + eventData.error.toString());
        if (eventData.disconnect !== undefined) {
            console.log('Disconnect packet: ' + JSON.stringify(eventData.disconnect));
        }
        console.log('******************************************************')
    });

    client.on('stopped', (eventData: mqtt5.StoppedEvent) => {
        console.log('******************************************************')
        console.log("Stopped event");
        console.log('******************************************************')
    });


    return client;
    
}

async function main(ioTConfig: DeviceConfig) {
    client = createClient(ioTConfig)

    const connectionSuccess = once(client, "connectionSuccess");

    client.start();

    await connectionSuccess;

    setInterval(async () => {
        const qos0PublishResult = await client!.publish({
            qos: mqtt5.QoS.AtLeastOnce,
            topicName: "device/temperature",
            payload: {
                temperature: Math.floor(Math.random() * (45-25)) + 15,
                deviceId: ioTConfig.clientId
            }
        });

        console.log('QoS 1 publish result: ' + JSON.stringify(qos0PublishResult));
    }, 3000);

}

async function cleanup() {
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('Cleaning up client connection');
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

    if (client) {
        const stopped = once(client, "stopped");
        client.stop();
        await stopped;
        client.close();
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        console.log('Finishing Cleaning up client connection');
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    }

    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('Exiting app');
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    process.exit()
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

main(iotDevice)

export default {}