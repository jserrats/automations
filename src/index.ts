

import 'dotenv/config'
import { router } from "mqtt-assistant";
import { zigbee, esphome, Timer, Sun, Alarm, TelegramClient } from "mqtt-assistant"

console.log("[i] Starting Automations")

// Living Room
var livingroomRemote = new zigbee.RemoteE2002("livingroom_remote")
var livingroomSmoothLights = new zigbee.PowerE1603("livingroom_smooth_lights")
var clock = new esphome.LightESPHome("minimatrix", "clock")
var livingRoomClockTimer = new Timer()
router.addAutomation({ trigger: livingroomRemote.trigger.up, callback: () => { livingroomSmoothLights.toggle() } })
router.addAutomation({
    trigger: livingroomRemote.trigger.down,
    callback: () => {
        clock.off(),
            livingRoomClockTimer.setTimeout({ hours: 8 },
                () => { clock.on() },
                {
                    cancelTrigger: livingroomRemote.trigger.holdDown,
                    cancelCallback: () => { clock.on() }
                })
    }
})

// Workshop
var workshopPower = new zigbee.PowerE1603("workshop_power")
var workshopRemote = new zigbee.RemoteE1812("workshop_remote")
router.addAutomation({ trigger: workshopRemote.trigger.click, callback: () => { workshopPower.toggle() } })

// Laundry room
var laundrySensor = new zigbee.PresenceSensorZigbee("laundry_presence")
var laundryLight = new zigbee.LightZigbee("laundry_light")
router.addAutomation({ trigger: laundrySensor.trigger.occupied, callback: () => { laundryLight.on() } })
router.addAutomation({ trigger: laundrySensor.trigger.cleared, callback: () => { laundryLight.off() } })

// Studio
var studioPresence = new esphome.BinarySensorESPHome("datacenter", "studio_presence")
var studioLight = new zigbee.LightLED1623G12("studio_light")
var deskPower = new zigbee.PowerE1603("desk_power")
var deskTimer = new Timer()
var shelvesLight = new zigbee.LightZigbee("light3")
var shelvesLightTimer = new Timer()

router.addAutomation({
    trigger: studioPresence.trigger.on, callback: () => {
        studioLight.on()
        deskPower.on()
        shelvesLight.on({ brightness: 180 })
    }
})
router.addAutomation({
    trigger: studioPresence.trigger.off, callback: () => {
        studioLight.off()

        deskTimer.setTimeout({ minutes: 5 }, () => {
            deskPower.off()
            shelvesLight.setBrightness(100)
        }, { cancelTrigger: studioPresence.trigger.on })

        shelvesLightTimer.setTimeout({ minutes: 10 }, () => {
            shelvesLight.off()
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
    ], callback: () => { bedroomFan.toggle() }
})

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.trigger.bottomLeftDoubleClick,
        bedroomRemoteRight.trigger.bottomLeftDoubleClick
    ], callback: () => {
        bedroomFan.on()
        bedroomFanTimer.setTimeout({ minutes: 30 }, () => {
            bedroomFan.off()
        }, {
            cancelTrigger: [
                bedroomRemoteLeft.trigger.bottomLeftHold,
                bedroomRemoteRight.trigger.bottomLeftHold
            ]
        })
    }
})

// lights

const dayLight = { brightness: 254, colorTemp: 250 }
const warmLight = { brightness: 5, colorTemp: 450 }

var bedroomLightLeft = new zigbee.LightLED1623G12("bedroom_left_light")
var bedroomLightRight = new zigbee.LightLED1623G12("bedroom_right_light")
var bedroomRemoteEntrance = new zigbee.RemoteE1812("bedroom_remote")

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.trigger.bottomRightSingleClick,
        bedroomRemoteRight.trigger.bottomRightSingleClick,
        bedroomRemoteEntrance.trigger.click
    ],
    callback: () => {
        if (bedroomLightLeft.state && bedroomLightRight.state) {
            bedroomLightLeft.off(),
                bedroomLightRight.off()
        } else {
            bedroomLightLeft.on(dayLight),
                bedroomLightRight.on(dayLight)
        }
    }
})

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.trigger.bottomRightDoubleClick,
        bedroomRemoteRight.trigger.bottomRightDoubleClick,
    ],
    callback: () => {
        bedroomLightLeft.on(warmLight),
            bedroomLightRight.on(warmLight)
    }
})

router.addAutomation({
    trigger: [
        bedroomRemoteRight.trigger.bottomRightHold,
    ],
    callback: () => {
        bedroomLightLeft.off()
        bedroomLightRight.on(warmLight)
    }
})

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.trigger.bottomRightHold,
    ],
    callback: () => {
        bedroomLightRight.off()
        bedroomLightLeft.on(warmLight)
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
        mosquitoRepellant.on()
        mosquitoTimer.setTimeout({ hours: 8 }, () => {
            mosquitoRepellant.off()
        }, {
            cancelTrigger: [
                bedroomRemoteLeft.trigger.topRightHold,
                bedroomRemoteRight.trigger.topRightHold
            ],
            cancelCallback: () => { mosquitoRepellant.off() },
            publishTopic: "mosquito"
        })
    }
})

// Kitchen
var sandwich = new esphome.SwitchESPHome("sandwich", "sandwich")
var sandwichTimer = new Timer()

router.addAutomation({
    trigger: sandwich.trigger.on,
    callback: () => {
        sandwichTimer.setTimeout({ minutes: 8 },
            () => { sandwich.off() },
            {
                publishTopic: "sandwich",
                cancelTrigger: sandwich.trigger.off
            })
    }
})

// weather

var sun = new Sun(41.3831173, 2.1640883)

// alarm

var door = new zigbee.ContactSensorZigbee("magnet0", { inverted: true })
var window1 = new zigbee.ContactSensorZigbee("magnet1")
var window2 = new zigbee.ContactSensorZigbee("magnet2")

new Alarm("home", [door, window1, window2])