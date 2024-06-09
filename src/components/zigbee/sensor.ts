import { ZigbeeComponent, InboundZigbeeInfo } from "./zigbee"
import { Trigger } from "../../types"

export class PresenceSensorZigbee extends ZigbeeComponent {
    occupancy = false
    actionTopic = this.topic + "/action"
    occupancyTriggered: Trigger = { topic: this.actionTopic, payload: "ON" }
    occupancyCleared: Trigger = { topic: this.actionTopic, payload: "OFF" }

    updateComponent(message: PresenceSensorZigbeeComponentInfo): void {
        if (this.occupancy == !message.occupancy) { this.triggerItself() }
        this.occupancy = message.occupancy
        super.updateComponent(message)
    }

    triggerItself() {
        this.client.publish(this.actionTopic, !this.occupancy ? "ON" : "OFF")
    }

}

type PresenceSensorZigbeeComponentInfo = {
    occupancy: boolean
} & InboundZigbeeInfo