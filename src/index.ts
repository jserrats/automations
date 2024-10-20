

import 'dotenv/config'
import { router } from "mqtt-assistant";
import { zigbee, esphome, telegram, Timer, Sun, Alarm, Weather, assistant } from "mqtt-assistant"

console.log("[i] Starting Automations")
telegram.info("Starting Automations")

// Misc

new zigbee.ZigbeeMonitor(["music_light"])
new esphome.EsphomeMonitor()

// Living Room
var livingroomRemote = new zigbee.RemoteE2002("livingroom_remote")
var livingroomSmoothLights = new zigbee.PowerE1603("livingroom_smooth_lights")
var clock = new esphome.LightESPHome("minimatrix", "clock")
var livingRoomClockTimer = new Timer()
router.addAutomation({ trigger: livingroomRemote.trigger.up, callback: () => { livingroomSmoothLights.toggle() } })
router.addAutomation({
    trigger: livingroomRemote.trigger.down,
    callback: () => {
        clock.setOff(),
            livingRoomClockTimer.setTimeout({ hours: 8 },
                () => { clock.setOn() },
                {
                    cancelTrigger: livingroomRemote.trigger.holdDown,
                    cancelCallback: () => { clock.setOn() }
                })
    }
})

// Lobby
var lobbyLight = new zigbee.LightLED1623G12("lobby_light")

// Workshop
var workshopPower = new zigbee.PowerE1603("workshop_power", { autoOff: { hours: 4 } })
var workshopRemote = new zigbee.RemoteE1812("workshop_remote")
router.addAutomation({ trigger: workshopRemote.trigger.click, callback: () => { workshopPower.toggle() } })

// Laundry room
var laundrySensor = new zigbee.PresenceSensorZigbee("laundry_presence")
var laundryLight = new zigbee.LightZigbee("laundry_light")
router.addAutomation({ trigger: laundrySensor.trigger.occupied, callback: () => { laundryLight.setOn() } })
router.addAutomation({ trigger: laundrySensor.trigger.cleared, callback: () => { laundryLight.setOff() } })

// Music

var musicRemote = new zigbee.RemoteE2201("music_remote")
var musicMoodLight = new zigbee.LightLED1623G12("mood_music_light")

router.addAutomation({ trigger: musicRemote.trigger.topClick, callback: () => { musicMoodLight.toggle() } })
router.addAutomation({ trigger: musicRemote.trigger.bottomClick, callback: () => { musicMoodLight.setOn(brighterWarmLight) } })
router.addAutomation({ trigger: musicRemote.trigger.holdBottomClick, callback: () => { musicMoodLight.setOn(dayLight) } })

// Studio
var studioPresence = new esphome.BinarySensorESPHome("datacenter", "studio_presence")
var studioLight = new zigbee.LightLED1623G12("studio_light")
var studioFan = new zigbee.PowerE1603("studio_fan")
var deskPower = new zigbee.PowerE1603("desk_power")
var deskTimer = new Timer()
var shelvesLight = new zigbee.LightZigbee("studio_shelf_light")
var shelvesLightTimer = new Timer()

router.addAutomation({
    trigger: studioPresence.trigger.on, callback: () => {
        studioLight.setOn()
        deskPower.setOn()
        shelvesLight.setOn({ brightness: 180 })
    }
})
router.addAutomation({
    trigger: studioPresence.trigger.off, callback: () => {
        studioLight.setOff()

        deskTimer.setTimeout({ minutes: 5 }, () => {
            deskPower.setOff()
            shelvesLight.setBrightness(100)
        }, { cancelTrigger: studioPresence.trigger.on })

        shelvesLightTimer.setTimeout({ minutes: 10 }, () => {
            shelvesLight.setOff()
            studioFan.setOff()
        }, { cancelTrigger: studioPresence.trigger.on })
    }
})

// Bedroom
var bedroomRemoteLeft = new zigbee.RemoteTS0044("bedroom_left_remote")
var bedroomRemoteRight = new zigbee.RemoteTS0044("bedroom_right_remote")

var bedroomFan = new zigbee.PowerE1603("bedroom_fan")
var bedroomFanTimer = new Timer()

// fan control
router.addAutomation({
    trigger: [
        bedroomRemoteLeft.trigger.bottomLeftSingleClick,
        bedroomRemoteRight.trigger.bottomLeftSingleClick
    ], callback: () => {
        bedroomFan.toggle();
        bedroomFanTimer.cancelTimeout()
    }
})

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.trigger.bottomLeftDoubleClick,
        bedroomRemoteRight.trigger.bottomLeftDoubleClick
    ], callback: () => {
        bedroomFan.setOn()
        bedroomFanTimer.setTimeout({ minutes: 30 }, () => {
            bedroomFan.setOff()
        }, {
            cancelTrigger: [
                bedroomRemoteLeft.trigger.bottomLeftHold,
                bedroomRemoteRight.trigger.bottomLeftHold,
            ],
            publishTopic: "bedroom_fan"
        })
    }
})

// lights

const dayLight = { brightness: 254, colorTemp: 250 }
const warmLight = { brightness: 5, colorTemp: 450 }
const brighterWarmLight = { brightness: 100, colorTemp: 450 }

var bedroomLightLeft = new zigbee.LightLED1623G12("bedroom_left_light")
var bedroomLightRight = new zigbee.LightLED1623G12("bedroom_right_light")
var bedroomRemoteEntrance = new zigbee.RemoteE1812("bedroom_remote")
var nightStandLight = new esphome.LightESPHome("bedroom", "nightstand_led")

router.addAutomation({
    trigger: [bedroomRemoteLeft.trigger.topLeftHold, bedroomRemoteRight.trigger.topLeftHold], callback: () => {
        nightStandLight.setOff()
    }
})

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.trigger.bottomRightSingleClick,
        bedroomRemoteRight.trigger.bottomRightSingleClick,
        bedroomRemoteEntrance.trigger.click
    ],
    callback: () => {
        if (bedroomLightLeft.state || bedroomLightRight.state) {
            bedroomLightLeft.setOff();
            bedroomLightRight.setOff()
        } else {
            bedroomLightLeft.setOn(dayLight);
            bedroomLightRight.setOn(dayLight)
        }
    }
})

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.trigger.bottomRightDoubleClick,
        bedroomRemoteRight.trigger.bottomRightDoubleClick,
    ],
    callback: () => {
        bedroomLightLeft.setOn(warmLight),
            bedroomLightRight.setOn(warmLight)
    }
})

router.addAutomation({
    trigger: [
        bedroomRemoteRight.trigger.bottomRightHold,
    ],
    callback: () => {
        bedroomLightLeft.setOff()
        bedroomLightRight.setOn(warmLight)
    }
})

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.trigger.bottomRightHold,
    ],
    callback: () => {
        bedroomLightRight.setOff()
        bedroomLightLeft.setOn(warmLight)
    }
})

// mosquito

var mosquitoRepellant = new zigbee.PowerE1603("mosquito_power")
var mosquitoTimer = new Timer()

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.trigger.topRightSingleClick,
        bedroomRemoteRight.trigger.topRightSingleClick,
    ],
    callback: () => {
        if (mosquitoRepellant.state) {
            mosquitoRepellant.setOff()
            mosquitoTimer.cancelTimeout()
        } else {
            mosquitoRepellant.setOn()
            mosquitoTimer.setTimeout({ hours: 8 }, () => {
                mosquitoRepellant.setOff()
            }, {
                publishTopic: "mosquito"
            })
        }
    }
})

// Kitchen
var sandwich = new esphome.SwitchESPHome("sandwich", "sandwich")
var sandwichTimer = new Timer()
const airfryer_power = new zigbee.PowerSensorZigbee("airfryer_power")
const airfryer_binary = new assistant.CustomBinarySensor<number>("airfryer_binary", (value: number) => {
    return (value > 10)
})

airfryer_power.on('state', (value: number) => { airfryer_binary.updateComponent(value) })

router.addAutomation({
    trigger: sandwich.trigger.on,
    callback: () => {
        sandwichTimer.setTimeout({ minutes: 5 },
            () => { sandwich.setOff() },
            {
                publishTopic: "sandwich",
                cancelTrigger: sandwich.trigger.off
            })
    }
})

// weather

new Sun(41.3831173, 2.1640883)
new Weather(41.3831173, 2.1640883)

// alarm

var door = new zigbee.ClosureSensorZigbee("door_closure_sensor", { inverted: true })
var window1 = new zigbee.ClosureSensorZigbee("studio_window_closure_sensor")
var window2 = new zigbee.ClosureSensorZigbee("music_window_closure_sensor")

new Alarm("home", [door, window1, window2])

// everything off
router.addAutomation({
    trigger: bedroomRemoteLeft.trigger.topLeftSingleClick, callback: () => {
        sandwich.setOff()

        bedroomLightLeft.setOff()
        bedroomLightRight.setOff()

        deskPower.setOff()
        workshopPower.setOff()
        shelvesLight.setOff()
        studioLight.setOff()
        studioFan.setOff()

        lobbyLight.setOff()

        livingroomSmoothLights.setOff()
    }
})
