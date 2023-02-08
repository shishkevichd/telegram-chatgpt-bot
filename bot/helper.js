import Config from "./config.js"
import IncomingRequests from "./incomings.js"

export default class Helper {
    // Function that return boolean can user write to bot
    static isUserAllowedToWrite(userId) {
        const whitelistArray = Config().whitelist

        return whitelistArray.length > 0 ? whitelistArray.includes(userId) : true
    }

    // Function that return incoming request count by Telegram user id
    static getIncomingRequestCountsById(userId) {
        let userIncomingRequests = IncomingRequests.getIncomingRequests().filter((request) => {
            return request.id === userId
        })

        return userIncomingRequests.length
    }

    static generateId() {
        return (Math.random() + 1).toString(36).substring(4)
    }

    static convertToNormalText(string) {
        return string.replace(/\^\d+/g, (match) => str(match));
    }
}