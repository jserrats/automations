import { Trigger } from "../types"
import { Component } from "./component"
import { router } from "../router"

export class Timer extends Component {
    timeoutID: number = 0
    period: number = 0

    constructor(period?: Period) {
        super()
        this.setPeriod(period)
    }

    setTimeout(callback: CallableFunction, options?: Options) {
        this.cancelTimeout()
        if (typeof options !== 'undefined') {
            this.setPeriod(options.period)
            this.setCancelTrigger(options.cancelTrigger)
        }
        this.timeoutID = setTimeout(callback, this.period)
    }

    cancelTimeout() {
        clearTimeout(this.timeoutID)
    }

    private setPeriod(period?: Period) {
        if (typeof period !== 'undefined') {
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
            this.period = seconds * 1000
        }
    }

    private setCancelTrigger(trigger?: Trigger) {
        if (typeof trigger !== 'undefined') {
            router.addAutomation({ trigger: trigger, callback: () => { this.cancelTimeout(); } })
        }
    }

}

type Period = {
    seconds?: number,
    minutes?: number
    hours?: number
}

type Options = {
    period?: Period,
    cancelTrigger?: Trigger
}