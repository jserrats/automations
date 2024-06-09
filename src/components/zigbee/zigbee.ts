import { ZIGBEE2MQTT_TOPIC } from "../../topics"

import { Automation } from "../../types";
import { router } from "../../router"
import { Component } from "../component"

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


export type ZigbeeComponentInfo = {
    linkquality: number,
    state?: string,
}