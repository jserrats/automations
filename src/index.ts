

import 'dotenv/config'
import { zigbee, esphome, telegram, Timer, Sun, Alarm, assistant } from "mqtt-assistant"
import { globalEventManager } from 'mqtt-assistant/dist/components/component'

console.log("[i] Starting Automations")
telegram.info("Starting Automations")

// // Misc

new zigbee.ZigbeeMonitor()
new esphome.MonitorESPHome()

// // Living Room
var livingroomRemote = new zigbee.remotes.RemoteE2002("livingroom_remote")
var livingroomSmoothLights = new zigbee.switches.E1603("livingroom_smooth_lights")
var clock = new esphome.LightESPHome("minimatrix", "clock")
var livingRoomClockTimer = new Timer({ hours: 8 })

globalEventManager.on([livingRoomClockTimer.events.timeout, livingRoomClockTimer.events.cancel], () => { clock.setOn() })
livingroomRemote.on(livingroomRemote.button.holdDown, () => { livingRoomClockTimer.cancel() })
livingroomRemote.on(livingroomRemote.button.up, () => { livingroomSmoothLights.toggle() })
livingroomRemote.on(livingroomRemote.button.down, () => {
    clock.setOff()
    livingRoomClockTimer.start()
})

// // Lobby
// var lobbyLight = new zigbee.lights.LED1623G12("lobby_light")

// Workshop
var workshopPower = new zigbee.switches.E1603("workshop_power") // TODO: { autoOff: { hours: 4 } })
var workshopRemote = new zigbee.remotes.RemoteE1812("workshop_remote")
workshopRemote.on(workshopRemote.button.click, () => { workshopPower.toggle() })

// Laundry room
var laundrySensor = new zigbee.sensors.presence.IH012_RT01("laundry_presence")
var laundryLight = new zigbee.lights.LED1623G12("laundry_light")
laundrySensor.occupancy.on(laundrySensor.occupancy.events.state, (state) => { if (state) { laundryLight.setOn() } else { laundryLight.setOff() } })

// Music
var musicRemote = new zigbee.remotes.RemoteE2201("music_remote")
var musicMoodLight = new zigbee.lights.LED1623G12("mood_music_light")

musicRemote.on(musicRemote.button.topClick, () => { musicMoodLight.toggle() })
musicRemote.on(musicRemote.button.bottomClick, () => { musicMoodLight.setOn(brighterWarmLight) })
musicRemote.on(musicRemote.button.holdBottomClick, () => { musicMoodLight.setOn(dayLight) })


// Studio
var studioPresence = new esphome.BinarySensorESPHome("datacenter", "studio_presence")
var studioLight = new zigbee.lights.LED1623G12("studio_light")
var studioFan = new zigbee.switches.E1603("studio_fan")
var deskPower = new zigbee.switches.E1603("desk_power")
var shelvesLight = new zigbee.lights.YSR_MINI_01_dimmer("studio_shelf_light")
var deskBacklight = new zigbee.lights.GL_C_006P("desktop_backlighting")
var bluetooth = new zigbee.switches.XMSJ("bluetooth_audio_input")
var charger = new zigbee.switches.XMSJ("wireless_charger")
charger.on(charger.newTimeStateEvent({ hours: 4 }, (state) => { return state }), () => { charger.setOff() })

var deskTimer = new Timer({ minutes: 10 })

deskTimer.on(deskTimer.events.timeout, () => {
    deskPower.setOff()
    bluetooth.setOff()
    shelvesLight.brightness.set(100)
})

var shelvesLightTimer = new Timer({ minutes: 20 })

shelvesLightTimer.on(shelvesLightTimer.events.timeout, () => {
    shelvesLight.setOff()
    studioFan.setOff()
    deskBacklight.setOff()
})

studioPresence.on(studioPresence.events.state, (state) => {
    if (state) {
        deskTimer.cancel();
        shelvesLightTimer.cancel()
        studioLight.setOn()
        deskPower.setOn()
        shelvesLight.setOn({ brightness: 180 })
        deskBacklight.setOn()
    } else if (state === false) { // if new state is undefined do nothing
        studioLight.setOff()
        deskTimer.start()
        shelvesLightTimer.start()
    }
})

// Bedroom
var bedroomRemoteLeft = new zigbee.remotes.RemoteTS0044("bedroom_left_remote")
var bedroomRemoteRight = new zigbee.remotes.RemoteTS0044("bedroom_right_remote")

var bedroomFan = new zigbee.switches.E1603("bedroom_fan")
var bedroomFanTimer = new Timer({ minutes: 30 }, "bedroom_fan")

bedroomFanTimer.on(bedroomFanTimer.events.timeout, () => {
    bedroomFan.setOff()
})

globalEventManager.on(
    [
        bedroomRemoteLeft.button.bottomLeftHold,
        bedroomRemoteRight.button.bottomLeftHold
    ], () => { bedroomFanTimer.cancel() })

globalEventManager.on(
    [
        bedroomRemoteLeft.button.bottomLeftSingleClick,
        bedroomRemoteRight.button.bottomLeftSingleClick
    ], () => {
        bedroomFan.toggle();
        bedroomFanTimer.cancel()
    })

globalEventManager.on(
    [
        bedroomRemoteLeft.button.bottomLeftDoubleClick,
        bedroomRemoteRight.button.bottomLeftDoubleClick
    ], () => {
        bedroomFan.setOn()
        bedroomFanTimer.start()
    })

// lights

const dayLight = { brightness: 254, color_temp: 250 }
const warmLight = { brightness: 5, color_temp: 450 }
const brighterWarmLight = { brightness: 218, color_temp: 450 }

var bedroomLightLeft = new zigbee.lights.LED1623G12("bedroom_left_light")
var bedroomLightRight = new zigbee.lights.LED1623G12("bedroom_right_light")
var bedroomMoodLight = new zigbee.switches.E1603("bedroom_mood_light")
var bedroomRemoteEntrance = new zigbee.remotes.RemoteE2201("bedroom_remote")
var nightStandLight = new esphome.LightESPHome("bedroom", "nightstand_led")

globalEventManager.on(
    [
        bedroomRemoteLeft.button.topLeftHold,
        bedroomRemoteRight.button.topLeftHold
    ], () => { nightStandLight.setOff() })

globalEventManager.on(
    [
        bedroomRemoteRight.button.bottomRightSingleClick,
        bedroomRemoteLeft.button.bottomRightSingleClick,
        bedroomRemoteEntrance.button.topClick
    ],
    () => {
        if (bedroomLightLeft.state || bedroomLightRight.state || bedroomMoodLight.state) {
            bedroomLightLeft.setOff(),
                bedroomLightRight.setOff(),
                bedroomMoodLight.setOff()
        } else {
            bedroomLightLeft.setOn(dayLight),
                bedroomLightRight.setOn(dayLight)
        }
    })

globalEventManager.on(
    [
        bedroomRemoteRight.button.topLeftSingleClick,
        bedroomRemoteLeft.button.topLeftSingleClick,
        bedroomRemoteEntrance.button.bottomClick
    ],
    () => {
        if (bedroomMoodLight.state) {
            bedroomMoodLight.setOff()
        } else {
            bedroomMoodLight.setOn()
            bedroomLightRight.setOff()
            bedroomLightLeft.setOff()
        }
    })

globalEventManager.on(
    [
        bedroomRemoteRight.button.bottomRightDoubleClick,
        bedroomRemoteLeft.button.bottomRightDoubleClick
    ], () => {
        bedroomLightLeft.setOn(warmLight),
            bedroomLightRight.setOn(warmLight)
    })



bedroomRemoteRight.on(bedroomRemoteRight.button.bottomRightHold, () => {
    bedroomLightLeft.setOff()
    bedroomLightRight.setOn(warmLight)
})
bedroomRemoteLeft.on(bedroomRemoteLeft.button.bottomRightHold, () => {
    bedroomLightRight.setOff()
    bedroomLightLeft.setOn(warmLight)
})


// // mosquito

var mosquitoRepellant = new zigbee.switches.E1603("mosquito_power")
var mosquitoTimer = new Timer({ hours: 8 }, "mosquito")
mosquitoTimer.on(mosquitoTimer.events.timeout, () => { mosquitoRepellant.setOff() })

globalEventManager.on(
    [
        bedroomRemoteRight.button.topRightSingleClick,
        bedroomRemoteLeft.button.topRightSingleClick
    ], () => {
        if (mosquitoRepellant.state) {
            mosquitoRepellant.setOff()
            mosquitoTimer.cancel()
        } else {
            mosquitoRepellant.setOn()
            mosquitoTimer.start()
        }
    })

// // Kitchen
var sandwich = new esphome.SwitchESPHome("sandwich", "sandwich")
var sandwichTimer = new Timer({ minutes: 5 }, "sandwich")
sandwichTimer.on(sandwichTimer.events.timeout, () => { sandwich.setOff() })
sandwich.on(sandwich.events.state, () => { if (sandwich.state) { sandwichTimer.start() } else { sandwichTimer.cancel() } })
const airfryer_power = new zigbee.switches.BSD29_1("airfryer_power")
const airfryer_binary = new assistant.CustomSensor<boolean>("airfryer_binary", airfryer_power.power, (value) => {
    return (value as number > 10)
})
// // weather

new Sun(41.3831173, 2.1640883)
// new Weather(41.3831173, 2.1640883)

// // alarm

var door = new zigbee.sensors.closure.TS0203("door_closure_sensor", true)
var window1 = new zigbee.sensors.closure.TS0203("studio_window_closure_sensor")
var window2 = new zigbee.sensors.closure.TS0203("music_window_closure_sensor")

new Alarm("home", [door.contact, window1.contact, window2.contact])