
import { router } from "./router";
import { RemoteE2002, RemoteE1812 } from "./components/remote"
import { PowerE1603 } from "./components/power"
import { PresenceSensor } from "./components/sensor"
import { Light } from "./components/light"

console.log("[i] Starting Automations")

let livingroom_remote = new RemoteE2002("livingroom_remote")
let livingroom_smooth_lights = new PowerE1603("power4")
let workshop_power = new PowerE1603("power6")
let workshop_remote = new RemoteE1812("workshop_remote")
let laundry_sensor = new PresenceSensor("presence0")
let laundry_light = new Light("light0")

// Living Room
router.addAutomation({ trigger: livingroom_remote.up, callback: () => { livingroom_smooth_lights.toggle() } })

// Workshop
router.addAutomation({ trigger: workshop_remote.click, callback: () => { workshop_power.toggle() } })

// Laundry room
router.addAutomation({ trigger: laundry_sensor.occupancyTriggered, callback: () => { laundry_light.on() } })
router.addAutomation({ trigger: laundry_sensor.occupancyCleared, callback: () => { laundry_light.off() } })
