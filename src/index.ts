
import { router } from "./router";
import { zigbee, esphome, Timer } from "./components"

console.log("[i] Starting Automations")

// Living Room
let livingroom_remote = new zigbee.RemoteE2002("livingroom_remote")
let livingroom_smooth_lights = new zigbee.PowerE1603("power4")
router.addAutomation({ trigger: livingroom_remote.up, callback: () => { livingroom_smooth_lights.toggle() } })

// Workshop
let workshop_power = new zigbee.PowerE1603("power6")
let workshop_remote = new zigbee.RemoteE1812("workshop_remote")
router.addAutomation({ trigger: workshop_remote.click, callback: () => { workshop_power.toggle() } })

// Laundry room
let laundry_sensor = new zigbee.PresenceSensorZigbee("presence0")
let laundry_light = new zigbee.LightZigbee("light0")
router.addAutomation({ trigger: laundry_sensor.occupancyTriggered, callback: () => { laundry_light.on() } })
router.addAutomation({ trigger: laundry_sensor.occupancyCleared, callback: () => { laundry_light.off() } })

// Studio
let studioPresence = new esphome.BinarySensorESPHome("datacenter", "studio_presence")
let studioLight = new zigbee.LightZigbee("studio_light")
let deskPower = new zigbee.PowerE1603("power1")
let deskTimer = new Timer({ minutes: 1 })

router.addAutomation({
    trigger: studioPresence.turnedOn, callback: () => {
        console.log("in")
        studioLight.on()
        deskPower.on()
        deskTimer.cancelTimeout()
    }
})
router.addAutomation({
    trigger: studioPresence.turnedOff, callback: () => {
        console.log("out")
        studioLight.off()
        deskTimer.setTimeout(() => {
            deskPower.off()
        })
    }
})
