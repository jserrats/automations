import { ZigbeeComponent } from "./zigbee"
import { Trigger } from "../../types"

export class RemoteZigbee extends ZigbeeComponent {
    actionTopic = this.topic + "/action"

}

export class RemoteE2002 extends RemoteZigbee {
    // 4 button IKEA powered by 2xAAA

    up: Trigger = { topic: this.actionTopic, payload: "on" }
    down: Trigger = { topic: this.actionTopic, payload: "off" }
    left: Trigger = { topic: this.actionTopic, payload: "arrow_left_click" }
    right: Trigger = { topic: this.actionTopic, payload: "arrow_right_click" }

}

export class RemoteE1812 extends RemoteZigbee {
    // 1 button IKEA remote powered by CR2032

    click: Trigger = { topic: this.actionTopic, payload: "on" }
}