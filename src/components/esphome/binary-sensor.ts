import { ESPHomeComponent } from "./esphome"
import { router } from "../../router"
import { Automation, Trigger } from "../../types"

export class BinarySensorESPHome extends ESPHomeComponent {
    sensorTopic: string
    state: boolean = false
    updater: Automation

    turnedOn: Trigger = { topic: "", payload: "ON" }
    turnedOff: Trigger = { topic: "", payload: "OFF" }

    constructor(name: string, component: string) {
        super(name)
        this.sensorTopic = this.topic + "/binary_sensor/" + component + "/state"
        this.turnedOff.topic = this.sensorTopic
        this.turnedOn.topic = this.sensorTopic
        this.updater = {
            trigger: { topic: this.topic, payload: "*" }, callback: (message: Trigger) => {
                this.updateComponent(message.payload)
            }
        }
        router.addAutomation(this.updater)
    }

    updateComponent(message: string) {
        this.state = (message == "ON")
    }
}