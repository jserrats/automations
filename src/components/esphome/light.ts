import { ESPHomeComponent } from "./esphome"
import { router } from "../../router"
import { Automation, Trigger } from "../../types"

export class LightESPHome extends ESPHomeComponent {
    sensorTopic: string
    commandTopic: string
    state: boolean = false
    updater: Automation

    turnedOn: Trigger = { topic: "", payload: "*OFF*" }
    turnedOff: Trigger = { topic: "", payload: "*ON*" }

    constructor(name: string, component: string) {
        super(name)
        this.sensorTopic = this.topic + "/light/" + component + "/state"
        this.commandTopic = this.topic + "/light/" + component + "/command"
        this.turnedOff.topic = this.sensorTopic
        this.turnedOn.topic = this.sensorTopic
        this.updater = {
            trigger: { topic: this.sensorTopic, payload: "*" }, callback: (message: Trigger) => {
                this.updateComponent(message.payload)
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

    toggle() {
        this.set(!this.state)
    }

    private set(status: boolean) {
        this.client.publish(this.commandTopic, JSON.stringify({ state: status ? "ON" : "OFF" }))
    }

    private updateComponent(message: string) {
        this.state = (JSON.parse(message).state == "ON")
    }
}