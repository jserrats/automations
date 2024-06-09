import { ZigbeeComponent, ZigbeeComponentInfo } from "./zigbee"


export class LightZigbee extends ZigbeeComponent {
    setTopic = this.topic + "/set"
    state: boolean = false
    private brightness: number = 254
    private colorTemp?: number

    setBrightness(level: number) {
        if (level > 0 && level < 255) {
            this.brightness = level
        }
        // apply new brightness only if the light is already on
        if (this.state) {
            this.set(true)
        }
    }

    on(brightness?: number) {
        if (typeof brightness !== 'undefined') {
            this.setBrightness(brightness)
        }
        this.set(true)
    }

    off() {
        this.set(false)
    }

    toggle() {
        this.set(!this.state)
    }

    private set(order: boolean) {
        this.client.publish(this.setTopic, JSON.stringify({ state: order ? "ON" : "OFF", brightness: this.brightness }))
    }

    updateComponent(message: LightZigbeeComponentInfo): void {
        this.state = (message.state == "ON")
        this.brightness = message.brightness
        this.colorTemp = message.color_temp
        super.updateComponent(message)
    }
}

interface LightZigbeeComponentInfo extends ZigbeeComponentInfo {
    brightness: number,
    color_temp?: number
}