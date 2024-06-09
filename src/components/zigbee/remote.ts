import { ZigbeeComponent } from "./zigbee"
import { Trigger } from "../../types"

export class RemoteZigbee extends ZigbeeComponent {
    action_topic = this.topic + "/action"

}

export class RemoteE2002 extends RemoteZigbee {
    // 4 button IKEA powered by 2xAAA

    up: Trigger = { topic: this.action_topic, payload: "on" }
    down: Trigger = { topic: this.action_topic, payload: "off" }
    left: Trigger = { topic: this.action_topic, payload: "arrow_left_click" }
    right: Trigger = { topic: this.action_topic, payload: "arrow_right_click" }

}

export class RemoteE1812 extends RemoteZigbee {
    // 1 button IKEA remote powered by CR2032

    click: Trigger = { topic: this.action_topic, payload: "on" }
}