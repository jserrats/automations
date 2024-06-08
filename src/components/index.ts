import { ZIGBEE2MQTT_TOPIC } from "../topics"
import { ESPHOME_TOPIC } from "../topics"

import { client } from "../mqtt";
import { MqttClient } from "mqtt/*";
import { Automation } from "../types";
import { ZigbeeComponentInfo } from "./types"
import { router } from "../router"

export class Component {
    client: MqttClient

    constructor() {
        this.client = client
    }
}

export class ESPHomeComponent extends Component {
    topic: string

    constructor(name: string) {
        super()
        this.topic = ESPHOME_TOPIC + name
    }

}

export class ZigbeeComponent extends Component {
    topic: string
    linkquality = 0
    updater: Automation

    constructor(name: string) {
        super()
        this.topic = ZIGBEE2MQTT_TOPIC + name
        this.updater = { trigger: { topic: this.topic, payload: "*" }, callback: (message: string) => { this.updateComponent(JSON.parse(message)) } }
        router.addAutomation(this.updater)
    }

    updateComponent(message: ZigbeeComponentInfo) {
        this.linkquality = message["linkquality"]
    }
}

