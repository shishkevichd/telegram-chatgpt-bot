let incomingRequests = []

export default class IncomingRequests {
    // Function that return array with incoming requests
    static getIncomingRequests() {
        return incomingRequests
    }

    // Function that add incoming request
    static addIncomingRequest(json) {
        incomingRequests.push(json)
    }

    // Function that delete incoming request
    static deleteIncomingRequest(code) {
        incomingRequests = incomingRequests.filter((request) => {
            return request.code != code
        })
    }
}