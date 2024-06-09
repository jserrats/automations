import { ZigbeeComponent, ZigbeeComponentInfo } from "./zigbee"
import { Trigger } from "../../types"

export class PresenceSensorZigbee extends ZigbeeComponent {
    occupancy = false
    action_topic = this.topic + "/action"
    occupancyTriggered: Trigger = { topic: this.action_topic, payload: "ON" }
    occupancyCleared: Trigger = { topic: this.action_topic, payload: "OFF" }

    updateComponent(message: PresenceSensorZigbeeComponentInfo): void {
        if (this.occupancy == !message.occupancy) { this.triggerItself() }
        this.occupancy = message.occupancy
        super.updateComponent(message)
    }

    triggerItself() {
        this.client.publish(this.action_topic, !this.occupancy ? "ON" : "OFF")
    }

}

interface PresenceSensorZigbeeComponentInfo extends ZigbeeComponentInfo {
    occupancy: boolean
}