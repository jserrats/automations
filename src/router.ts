import { Automation } from "./types"
import wcmatch from 'wildcard-match'


class Router {
    private routes: Automation[] = []

    addAutomation(automation: Automation) {
        this.routes.push(automation)
    }

    route(newTopic: string, newPayload: string) {
        this.routes.forEach((automation: Automation) => {
            if (automation.trigger.topic == newTopic && wcmatch(automation.trigger.payload)(newPayload)) {
                automation.callback(newPayload)
            }
        });

    }
}


export let router = new Router();
