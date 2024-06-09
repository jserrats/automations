import { Trigger } from "../types"
import { Component } from "./component"
import { router } from "../router"

export class Timer extends Component {
    timeoutID: number = 0
    period: number = 0
    cancelCallback: CallableFunction = () => { }

    constructor(period?: Period, cancelCallback?: CallableFunction) {
        super()
        if (typeof period !== 'undefined') {
            this.setPeriod(period)
        }
        if (typeof cancelCallback !== 'undefined') {
            this.cancelCallback = cancelCallback
        }
    }

    setTimeout(callback: CallableFunction, options?: Options) {
        this.cancelTimeout()
        if (typeof options !== 'undefined') {
            if (typeof options.period !== 'undefined') {
                this.setPeriod(options.period)
            }
            if (typeof options.cancelTrigger !== 'undefined') {
                this.setCancelTrigger(options.cancelTrigger)
            }
        }
        this.timeoutID = setTimeout(callback, this.period)
    }

    cancelTimeout() {
        clearTimeout(this.timeoutID)
    }

    private setPeriod(period: Period) {
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

type Period = {
    seconds?: number,
    minutes?: number
    hours?: number
}

type Options = {
    period?: Period,
    cancelTrigger?: Trigger | Trigger[]
}