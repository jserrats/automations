import { ESPHomeComponent } from "./esphome"
import { router } from "../../router"
import { Automation, Trigger } from "../../types"

export class BinarySensorESPHome extends ESPHomeComponent {
    sensor_topic: string
    state: boolean = false
    updater: Automation

    turnedOn: Trigger = { topic: "", payload: "ON" }
    turnedOff: Trigger = { topic: "", payload: "OFF" }

    constructor(name: string, component: string) {
        super(name)
        this.sensor_topic = this.topic + "/binary_sensor/" + component + "/state"
        this.turnedOff.topic = this.sensor_topic
        this.turnedOn.topic = this.sensor_topic
        this.updater = {
            trigger: { topic: this.topic, payload: "*" }, callback: (message: string) => {
                this.updateComponent(message)
            }
        }
        router.addAutomation(this.updater)
    }

    updateComponent(message: string) {
        this.state = (message == "ON")
    }
}