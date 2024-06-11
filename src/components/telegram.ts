import { client } from "../mqtt"

export class Telegram {
    static send(message: string) {
        client.publish("notify/telegram", message)
    }
}