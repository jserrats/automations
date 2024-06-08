
import { router } from "./router";
import { E2002, E1812 } from "./components/remote"
import { E1603 } from "./components/power"

let livingroom_remote = new E2002("livingroom_remote")
let livingroom_smooth_lights = new E1603("power4")
let workshop_power = new E1603("power6")
let workshop_remote = new E1812("workshop_remote")

router.addAutomation({ trigger: livingroom_remote.up, callback: () => { livingroom_smooth_lights.toggle() } })
router.addAutomation({ trigger: workshop_remote.click, callback: () => { workshop_power.toggle() } })