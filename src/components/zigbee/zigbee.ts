import { ZIGBEE2MQTT_TOPIC } from "../../topics"

import { Telegram } from "../telegram"
import { router, CallbackMessage } from "../../router"
import { Component } from "../component"

export class ZigbeeComponent extends Component {
    topic: string
    linkquality = 0

    constructor(name: string) {
        super()
        this.topic = ZIGBEE2MQTT_TOPIC + name
        router.addAutomation({
            trigger: { topic: this.topic, payload: "*" },
            callback: (message: CallbackMessage) => { this.updateComponent(JSON.parse(message.payload)) }
        })
    }
    updateComponent(message: InboundZigbeeInfo) {
        this.linkquality = message["linkquality"]
    }
}

// Workaround to not flood with retained messages at startup
var noRetained = false
setTimeout(() => { noRetained = true; console.log("changing to offline") }, 1000)
router.addAutomation({
    trigger: { topic: ZIGBEE2MQTT_TOPIC + "/*/availability", payload: "*" },
    callback: (message: CallbackMessage) => {
        if (noRetained) { Telegram.send("[!] Zigbee component " + message.topic + " status: " + message.payload) }
    }
})

export type InboundZigbeeInfo = {
    linkquality: number,
}