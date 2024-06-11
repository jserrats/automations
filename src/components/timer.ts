import { Trigger } from "../types"
import { Component } from "./component"
import { router } from "../router"

export class Timer extends Component {
    private timeoutID: NodeJS.Timeout = setTimeout(() => { })
    private intervalID: NodeJS.Timeout = setInterval(() => { })
    private length: number = 0
    private seconds: number = 0
    private cancelCallback: CallableFunction = () => { }
    private publishTopic: string = ""


    constructor(length?: Length, cancelCallback?: CallableFunction) {
        super()
        if (typeof length !== 'undefined') {
            this.setLength(length)
        }
        if (typeof cancelCallback !== 'undefined') {
            this.cancelCallback = cancelCallback
        }
    }

    setTimeout(callback: CallableFunction, options?: Options) {
        this.cancelTimeout()
        if (typeof options !== 'undefined') {
            if (typeof options.period !== 'undefined') {
                this.setLength(options.period)
            }
            if (typeof options.cancelTrigger !== 'undefined') {
                this.setCancelTrigger(options.cancelTrigger)
            }
            if (typeof options.publishTopic !== 'undefined') {
                this.publishTopic = options.publishTopic
                this.intervalID = setInterval(() => {
                    this.seconds = this.seconds + 1;
                    this.publishTime()
                }, 1000)
            }
        }
        this.timeoutID = setTimeout(() => { clearInterval(this.intervalID); callback() }, this.length)
    }

    private publishTime() {
        this.client.publish("automations/timer/" + this.publishTopic, this.seconds.toString())
        this.client.publish("automations/timer/" + this.publishTopic + "/countdown", (this.length / 1000 - this.seconds).toString())
        this.client.publish("automations/timer/" + this.publishTopic + "/text", Timer.secondsToHms(this.seconds))
        this.client.publish("automations/timer/" + this.publishTopic + "/text_countdown", Timer.secondsToHms(this.length / 1000 - this.seconds))
    }

    private static secondsToHms(seconds: number) {
        seconds = Number(seconds);
        var h = Math.floor(seconds / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 3600 % 60);

        var hDisplay = h > 0 ? h + ("h ") : "";
        var mDisplay = m > 0 ? m + ("m ") : "";
        var sDisplay = s > 0 ? s + ("s") : "";
        return hDisplay + mDisplay + sDisplay;
    }

    private cancelTimeout() {
        clearTimeout(this.timeoutID)
    }

    private setLength(period: Length) {
        let seconds: number = 0;
        if (typeof period.seconds !== 'undefined') {
            seconds = period.seconds
        }
        if (typeof period.minutes !== 'undefined') {
            seconds = period.minutes * 60 + seconds
        }
        if (typeof period.hours !== 'undefined') {
            seconds = period.hours * 3600 + seconds
        }
        this.length = seconds * 1000
    }

    private setCancelTrigger(trigger: Trigger | Trigger[]) {
        if (typeof trigger !== 'undefined') {
            if (Array.isArray(trigger)) {
                trigger.forEach((element) => {
                    router.addAutomation({ trigger: element, callback: () => { this.cancelTimeout(); this.cancelCallback() } })
                });
            } else {
                router.addAutomation({ trigger: trigger, callback: () => { this.cancelTimeout(); this.cancelCallback() } })
            }
        }
    }

}

type Length = {
    seconds?: number,
    minutes?: number
    hours?: number
}

type Options = {
    period?: Length,
    cancelTrigger?: Trigger | Trigger[]
    publishTopic?: string
}