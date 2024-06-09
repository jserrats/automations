import { ZigbeeComponent } from "./zigbee"
import { Trigger } from "../../types"

export class RemoteZigbee extends ZigbeeComponent {
    actionTopic = this.topic + "/action"

}
/**
 * STYRBAR remote control
 * 4 button IKEA powered by 2xAAA
 */
export class RemoteE2002 extends RemoteZigbee {
    up: Trigger = { topic: this.actionTopic, payload: "on" }
    down: Trigger = { topic: this.actionTopic, payload: "off" }
    left: Trigger = { topic: this.actionTopic, payload: "arrow_left_click" }
    right: Trigger = { topic: this.actionTopic, payload: "arrow_right_click" }

}

/**
 * TRADFRI shortcut button
 * 1 button IKEA remote powered by CR2032
 */
export class RemoteE1812 extends RemoteZigbee {
    click: Trigger = { topic: this.actionTopic, payload: "on" }
}

/**
 * Wireless switch with 4 buttons 
 */
export class RemoteTS0044 extends RemoteZigbee {
    // 1 | 2
    //-------
    // 3 | 4

    topLeftSingleClick: Trigger = { topic: this.actionTopic, payload: "1_single" }
    topLeftDoubleClick: Trigger = { topic: this.actionTopic, payload: "1_double" }
    topLeftHold: Trigger = { topic: this.actionTopic, payload: "1_hold" }

    topRightSingleClick: Trigger = { topic: this.actionTopic, payload: "2_single" }
    topRightDoubleClick: Trigger = { topic: this.actionTopic, payload: "2_double" }
    topRightHold: Trigger = { topic: this.actionTopic, payload: "2_hold" }

    bottomLeftSingleClick: Trigger = { topic: this.actionTopic, payload: "3_single" }
    bottomLeftDoubleClick: Trigger = { topic: this.actionTopic, payload: "3_double" }
    bottomLeftHold: Trigger = { topic: this.actionTopic, payload: "3_hold" }

    bottomRightSingleClick: Trigger = { topic: this.actionTopic, payload: "4_single" }
    bottomRightDoubleClick: Trigger = { topic: this.actionTopic, payload: "4_double" }
    bottomRightHold: Trigger = { topic: this.actionTopic, payload: "4_hold" }

}