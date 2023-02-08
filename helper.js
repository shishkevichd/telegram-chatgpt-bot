export default class CGBHelper {
    static isUserAllowedToWrite(userId) {
        // Getting allowed users array from config
        const whitelistArray = ChatGptBotConfig.whitelist

        // Check is allowed users array includes ID
        return whitelistArray.length > 0 ? whitelistArray.includes(userId) : true
    }

    static getIncomingRequestCountsById(userId) {
        let userIncomingRequests = incomingRequests.filter((request) => {
            return request.id === userId
        })

        return userIncomingRequests.length
    }

    static generateId() {
        return (Math.random() + 1).toString(36).substring(4)
    }
}