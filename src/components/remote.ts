import { ZigbeeComponent } from "."
import { Trigger } from "../types"

export class Remote extends ZigbeeComponent {
    action_topic = this.topic + "/action"

}

export class RemoteE2002 extends Remote {
    // 4 button IKEA powered by 2xAAA

    up: Trigger = { topic: this.action_topic, payload: "on" }
    down: Trigger = { topic: this.action_topic, payload: "off" }
    left: Trigger = { topic: this.action_topic, payload: "arrow_left_click" }
    right: Trigger = { topic: this.action_topic, payload: "arrow_right_click" }

}

export class RemoteE1812 extends Remote {
    // 1 button IKEA remote powered by CR2032
    
    click: Trigger = { topic: this.action_topic, payload: "on" }
}