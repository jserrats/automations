import { ESPHomeComponent } from "./esphome"
import { router } from "../../router"
import { Automation, Trigger } from "../../types"

export class SwitchESPHome extends ESPHomeComponent {
    sensorTopic: string
    commandTopic: string
    state: boolean = false
    updater: Automation

    turnedOn: Trigger = { topic: "", payload: "ON" }
    turnedOff: Trigger = { topic: "", payload: "OFF" }

    constructor(name: string, component: string) {
        super(name)
        this.sensorTopic = this.topic + "/switch/" + component + "/state"
        this.commandTopic = this.topic + "/switch/" + component + "/command"
        this.turnedOff.topic = this.sensorTopic
        this.turnedOn.topic = this.sensorTopic
        this.updater = {
            trigger: { topic: this.topic, payload: "*" }, callback: (message: string) => {
                this.updateComponent(message)
            }
        }
        router.addAutomation(this.updater)
    }

    on() {
        this.set(true)
    }

    off() {
        this.set(false)
    }

    private set(status: boolean) {
        this.client.publish(this.commandTopic, status ? "ON" : "OFF")
    }

    private updateComponent(message: string) {
        this.state = (message == "ON")
    }
}