import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import { ChatGPTAPI } from "chatgpt";

// -=-=-=-=-=-
// Setting bot
// -=-=-=-=-=-

const ChatGptBotConfig = JSON.parse(
    fs.readFileSync("chatgptbot.config.json")
)

const ChatGptBot = new TelegramBot(
    ChatGptBotConfig.tokens.telegram,
    {
        polling: true
    }
)

const ChatGptAPI = new ChatGPTAPI({
    apiKey: ChatGptBotConfig.tokens.openai
})

// -=-=-=-=-=-
// Variables
// -=-=-=-=-=-

let incomingRequests = []

// -=-=-=-=-=-
// Helpers
// -=-=-=-=-=-

const ChatGptBotHelpers = {
    isUserAllowedToWrite(userId) {
        // Getting allowed users array from config
        const whitelistArray = ChatGptBotConfig.whitelist

        // Check is allowed users array includes ID
        return whitelistArray.length > 0 ? whitelistArray.includes(userId) : true
    },
    getIncomingRequestCountsById(userId) {
        let userIncomingRequests = incomingRequests.filter((request) => {
            return request.id === userId
        })

        return userIncomingRequests.length
    },
    generateId() {
        return (Math.random() + 1).toString(36).substring(4)
    }
}

// -=-=-=-=-=-
// Handle actions
// -=-=-=-=-=-

ChatGptBot.onText(/\/start/, (message) => {
    // Check if user is allowed
    if (ChatGptBotHelpers.isUserAllowedToWrite(message.from.id)) {
        // Send message
        ChatGptBot.sendMessage(message.chat.id, `Hello, i'm ChatGPT bot! I can answer on your questions.`)
        console.info(`[${new Date().toUTCString()}] User (${message.from.id}) write message.`)
    } else {
        console.info(`[${new Date().toUTCString()}] User (DENIED) (${message.from.id}) write message.`)
    }
})

ChatGptBot.onText(/(\w+)([\W+^\s])/, (message) => {
    // Check if user is allowed
    if (ChatGptBotHelpers.isUserAllowedToWrite(message.from.id)) {
        // Check if incoming requests >= maximal incoming requests
        if (ChatGptBotHelpers.getIncomingRequestCountsById(message.from.id) < ChatGptBotConfig.options.maxIncomingRequests) {
            // Check if message is not command
            if (!message.text.startsWith("/")) {
                // Send message
                console.info(`[${new Date().toUTCString()}] User (${message.from.id}) write question.`)

                const generatedMessageId = ChatGptBotHelpers.generateId()

                incomingRequests.push(
                    {
                        id: message.from.id,
                        code: generatedMessageId
                    }
                )

                ChatGptBot.sendMessage(message.chat.id, "Okay, please wait...").then((secondMessage) => {
                    // Send request to OpenAI API
                    console.info(`[${new Date().toUTCString()}] User (${message.from.id}) send request to OpenAPI. Waiting answer...`)
                    ChatGptAPI.sendMessage(message.text).then((response) => {
                        // Send response
                        console.info(`[${new Date().toUTCString()}] Message for User (${message.from.id}) delivered. Sending message...`)

                        // Send reply message
                        ChatGptBot.sendMessage(secondMessage.chat.id, response.text, {
                            reply_to_message_id: message.message_id
                        }).then(() => {
                            // If send message is success, delete second message
                            ChatGptBot.deleteMessage(secondMessage.chat.id, secondMessage.message_id)
                        }).catch(() => {
                            // If send message is fail, edit second message
                            ChatGptBot.editMessageText(response.text, {
                                message_id: secondMessage.message_id,
                                chat_id: secondMessage.chat.id
                            })
                        })

                        // Remove incoming request
                        incomingRequests = incomingRequests.filter((request) => {
                            return request.code != generatedMessageId
                        })
                    })
                }).catch((reason) => {
                    ChatGptBot.sendMessage(message.chat.id, "The bot was unable to send a request to ChatGPT. Perhaps something went wrong.")
                })
            }
        } else {
            ChatGptBot.sendMessage(message.chat.id, "Take your time, wait for the bot to respond to your requests.")
        }
    }
})