import { zigbee, esphome, Timer, assistant } from "mqtt-assistant"

var sandwich = new esphome.SwitchESPHome("sandwich", "sandwich")
var sandwichTimer = new Timer({ minutes: 5 }, "sandwich")

sandwichTimer.on(sandwichTimer.events.timeout, () => { sandwich.setOff() })
sandwich.on(sandwich.events.state, () => { if (sandwich.state) { sandwichTimer.start() } else { sandwichTimer.cancel() } })


const airfryer_power = new zigbee.switches.BSD29_1("airfryer_power")
const airfryer_binary = new assistant.CustomSensor<boolean>("airfryer_binary", airfryer_power.power, (value) => {
    return (value as number > 10)
})