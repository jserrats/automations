import mqtt from "mqtt";
import 'dotenv/config'
import * as topic from "./topics";
import { router } from "./router"

const MQTT_SERVER = process.env.MQTT_SERVER;
if (MQTT_SERVER === undefined) {
    throw new Error("[!] Missing MQTT_SERVER")
} else {
    MQTT_SERVER as string
}

export const client = mqtt.connect("mqtt://" + MQTT_SERVER, {
    will: { topic: topic.STATUS_TOPIC, payload: Buffer.from("offline") }
});


client.on("connect", () => {
    client.subscribe(topic.ZIGBEE2MQTT_TOPIC + "#", (err) => {
        if (!err) {
            client.publish(topic.STATUS_TOPIC, "online");
        }
    });
});


client.on("message", (topic, message) => {
    router.route(topic, message.toString())
});