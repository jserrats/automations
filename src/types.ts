export type Trigger = {
    topic: string,
    payload: string
}

export type Automation = {
    trigger: Trigger
    callback: CallableFunction
}