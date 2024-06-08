import { ZigbeeComponent, ZigbeeComponentInfo } from "."


class Power extends ZigbeeComponent {
    set_topic = this.topic + "/set"
    state: boolean = false

    on() {
        this.set(true)
    }

    off() {
        this.set(false)
    }

    toggle(){
        this.set(!this.state)
    }   

    private set(order: boolean) {
        this.client.publish(this.set_topic, order ? "ON" : "OFF")
    }

    updateComponent(message: ZigbeeComponentInfo): void {
        this.state = (message.state == "ON")
        super.updateComponent(message)
    }
}

export class PowerE1603 extends Power {

}