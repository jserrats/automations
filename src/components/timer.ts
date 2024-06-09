export class Timer {
    timeout: number = 0

    setTimeout(callback: CallableFunction, seconds: number) {
        this.cancelTimeout()
        this.timeout = setTimeout(callback, seconds * 1000)
    }

    cancelTimeout() {
        clearTimeout(this.timeout)
    }

}