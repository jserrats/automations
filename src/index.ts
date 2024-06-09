
import { router } from "./router";
import { zigbee, esphome, Timer } from "./components"

console.log("[i] Starting Automations")

// Living Room
var livingroomRemote = new zigbee.RemoteE2002("livingroom_remote")
var livingroomSmoothLights = new zigbee.PowerE1603("power4")
router.addAutomation({ trigger: livingroomRemote.up, callback: () => { livingroomSmoothLights.toggle() } })

// Workshop
var workshopPower = new zigbee.PowerE1603("power6")
var workshopRemote = new zigbee.RemoteE1812("workshop_remote")
router.addAutomation({ trigger: workshopRemote.click, callback: () => { workshopPower.toggle() } })

// Laundry room
var laundrySensor = new zigbee.PresenceSensorZigbee("presence0")
var laundryLight = new zigbee.LightZigbee("light0")
router.addAutomation({ trigger: laundrySensor.occupancyTriggered, callback: () => { laundryLight.on() } })
router.addAutomation({ trigger: laundrySensor.occupancyCleared, callback: () => { laundryLight.off() } })

// Studio
var studioPresence = new esphome.BinarySensorESPHome("datacenter", "studio_presence")
var studioLight = new zigbee.LightLED1623G12("studio_light")
var deskPower = new zigbee.PowerE1603("power1")
var deskTimer = new Timer({ minutes: 5 })
var shelvesLight = new zigbee.LightZigbee("light3")
var shelvesLightTimer = new Timer({ minutes: 10 })

router.addAutomation({
    trigger: studioPresence.turnedOn, callback: () => {
        studioLight.on()
        deskPower.on()
        shelvesLight.on({ brightness: 180 })
    }
})
router.addAutomation({
    trigger: studioPresence.turnedOff, callback: () => {
        studioLight.off()

        deskTimer.setTimeout(() => {
            deskPower.off()
            shelvesLight.setBrightness(100)
        }, { cancelTrigger: studioPresence.turnedOn })

        shelvesLightTimer.setTimeout(() => {
            shelvesLight.off()
        }, { cancelTrigger: studioPresence.turnedOn })
    }
})
