export class Timer {
    timeoutID: number = 0
    period: number = 0

    constructor(period?: Period) {
        if (typeof period !== 'undefined') {
            this.setPeriod(period)
        }
    }

    setTimeout(callback: CallableFunction, period?: Period) {
        this.cancelTimeout()
        this.timeoutID = setTimeout(callback, this.period)
    }

    cancelTimeout() {
        clearTimeout(this.timeoutID)
    }

    private setPeriod(timer: Period) {
        let seconds: number = 0;
        if (typeof timer.seconds !== 'undefined') {
            seconds = timer.seconds
        }
        if (typeof timer.minutes !== 'undefined') {
            seconds = timer.minutes * 60 + seconds
        }
        this.period = seconds * 1000
    }

}

type Period = {
    seconds?: number,
    minutes?: number
}