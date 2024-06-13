
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
var studioLight = new zigbee.LightLED1623G12("studio_light")
var deskPower = new zigbee.PowerE1603("power1")
var deskTimer = new Timer()
var shelvesLight = new zigbee.LightZigbee("light3")
var shelvesLightTimer = new Timer()

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

        deskTimer.setTimeout({ minutes: 5 }, () => {
            deskPower.off()
            shelvesLight.setBrightness(100)
        }, { cancelTrigger: studioPresence.turnedOn })

        shelvesLightTimer.setTimeout({ minutes: 10 }, () => {
            shelvesLight.off()
        }, { cancelTrigger: studioPresence.turnedOn })
    }
})

// Bedroom
var bedroomRemoteLeft = new zigbee.RemoteTS0044("button4.4")
var bedroomRemoteRight = new zigbee.RemoteTS0044("button4.2")

var bedroomFan = new zigbee.PowerE1603("power2")
var bedroomFanTimer = new Timer()

// fan control
router.addAutomation({
    trigger: [
        bedroomRemoteLeft.bottomLeftSingleClick,
        bedroomRemoteRight.bottomLeftSingleClick
    ], callback: () => { bedroomFan.toggle() }
})

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.bottomLeftDoubleClick,
        bedroomRemoteRight.bottomLeftDoubleClick
    ], callback: () => {
        bedroomFan.on()
        bedroomFanTimer.setTimeout({ minutes: 30 }, () => {
            bedroomFan.off()
        }, {
            cancelTrigger: [
                bedroomRemoteLeft.bottomLeftHold,
                bedroomRemoteRight.bottomLeftHold
            ]
        })
    }
})

// lights

const dayLight = { brightness: 254, colorTemp: 250 }
const warmLight = { brightness: 5, colorTemp: 450 }

var bedroomLightLeft = new zigbee.LightLED1623G12("bedroom_light")
var bedroomLightRight = new zigbee.LightLED1623G12("bedroom_light2")
var bedroomRemoteEntrance = new zigbee.RemoteE1812("button1.1")

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.bottomRightSingleClick,
        bedroomRemoteRight.bottomRightSingleClick,
        bedroomRemoteEntrance.click
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
        bedroomRemoteLeft.bottomRightDoubleClick,
        bedroomRemoteRight.bottomRightDoubleClick,
    ],
    callback: () => {
        bedroomLightLeft.on(warmLight),
            bedroomLightRight.on(warmLight)
    }
})

router.addAutomation({
    trigger: [
        bedroomRemoteRight.bottomRightHold,
    ],
    callback: () => {
        bedroomLightLeft.off()
        bedroomLightRight.on(warmLight)
    }
})

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.bottomRightHold,
    ],
    callback: () => {
        bedroomLightRight.off()
        bedroomLightLeft.on(warmLight)
    }
})

// mosquito

var mosquitoRepellant = new zigbee.PowerE1603("power3")
var mosquitoTimer = new Timer()

router.addAutomation({
    trigger: [
        bedroomRemoteLeft.topRightSingleClick,
        bedroomRemoteRight.topRightSingleClick,
    ],
    callback: () => {
        mosquitoRepellant.on()
        mosquitoTimer.setTimeout({ hours: 8 }, () => {
            mosquitoRepellant.off()
        }, {
            cancelTrigger: [
                bedroomRemoteLeft.topRightHold,
                bedroomRemoteRight.topRightHold
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
    trigger: sandwich.turnedOn,
    callback: () => {
        sandwichTimer.setTimeout({ minutes: 8 },
            () => { sandwich.off() },
            {
                publishTopic: "sandwich",
                cancelTrigger: sandwich.turnedOff
            })
    }
})