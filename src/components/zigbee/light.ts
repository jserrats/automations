import { ZigbeeComponent, ZigbeeComponentInfo } from "./zigbee"


export class LightZigbee extends ZigbeeComponent {
    set_topic = this.topic + "/set"
    state: boolean = false
    brightness: number = 0
    color_temp?: number

    setBrightness(level: number) {
        if (level > 0 && level < 255) {
            this.brightness = level
        }
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

    private set(order: boolean) {
        this.client.publish(this.set_topic, JSON.stringify({ state: order ? "ON" : "OFF", brightness: this.brightness }))
    }

    updateComponent(message: LightZigbeeComponentInfo): void {
        this.state = (message.state == "ON")
        this.brightness = message.brightness
        this.color_temp = message.color_temp
        super.updateComponent(message)
    }
}

interface LightZigbeeComponentInfo extends ZigbeeComponentInfo {
    brightness: number,
    color_temp?: number
}