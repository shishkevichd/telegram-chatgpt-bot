import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import { ChatGPTAPI } from "chatgpt";
import CGBHelper from "./helper.js";

// -=-=-=-=-=-
// Setting bot
// -=-=-=-=-=-

const CGB__Config = JSON.parse(
    fs.readFileSync("chatgptbot.config.json")
)

const CGB__Bot = new TelegramBot(
    CGB__Config.tokens.telegram,
    {
        polling: true,
    }
)

const CGB__Api = new ChatGPTAPI({
    apiKey: CGB__Config.tokens.openai
})

// -=-=-=-=-=-
// Variables
// -=-=-=-=-=-

let incomingRequests = []

// -=-=-=-=-=-
// Handle actions
// -=-=-=-=-=-

CGB__Bot.onText(/\/start/, (message) => {
    // Check if user is allowed
    if (CGBHelper.isUserAllowedToWrite(message.from.id)) {
        // Send message
        CGB__Bot.sendMessage(message.chat.id, `Hello, i'm ChatGPT bot! I can answer on your questions.`)
        console.info(`[${new Date().toUTCString()}] User (${message.from.id}) write message.`)
    } else {
        console.info(`[${new Date().toUTCString()}] User (DENIED) (${message.from.id}) write message.`)
    }
})

CGB__Bot.onText(/(\w+)([\W+^\s])/, (message) => {
    // Check if user is allowed
    if (CGBHelper.isUserAllowedToWrite(message.from.id)) {
        // Check if incoming requests >= maximal incoming requests
        if (CGBHelper.getIncomingRequestCountsById(message.from.id) < CGB__Config.options.maxIncomingRequests) {
            // Check if message is not command
            if (!message.text.startsWith("/")) {
                // Send message
                console.info(`[${new Date().toUTCString()}] User (${message.from.id}) write question.`)

                // Add incoming request
                const generatedMessageId = CGBHelper.generateId()
                incomingRequests.push(
                    {
                        id: message.from.id,
                        code: generatedMessageId
                    }
                )

                CGB__Bot.sendMessage(message.chat.id, "Okay, please wait...").then((secondMessage) => {
                    // Send request to OpenAI API
                    console.info(`[${new Date().toUTCString()}] User (${message.from.id}) send request to OpenAPI. Waiting answer...`)
                    CGB__Api.sendMessage(message.text).then((response) => {
                        // Send response
                        console.info(`[${new Date().toUTCString()}] Message for User (${message.from.id}) delivered. Sending message...`)

                        // Send reply message
                        CGB__Bot.sendMessage(secondMessage.chat.id, response.text, {
                            reply_to_message_id: message.message_id,
                            parse_mode: "MarkdownV2"
                        }).then(() => {
                            // If send message is success, delete second message
                            CGB__Bot.deleteMessage(secondMessage.chat.id, secondMessage.message_id)
                        }).catch(() => {
                            // If send message is fail, edit second message
                            CGB__Bot.editMessageText(response.text, {
                                message_id: secondMessage.message_id,
                                chat_id: secondMessage.chat.id,
                                parse_mode: "MarkdownV2"
                            })
                        })

                        // Remove incoming request
                        incomingRequests = incomingRequests.filter((request) => {
                            return request.code != generatedMessageId
                        })
                    })
                }).catch((reason) => {
                    CGB__Bot.sendMessage(message.chat.id, "The bot was unable to send a request to ChatGPT. Perhaps something went wrong.")
                })
            }
        } else {
            CGB__Bot.sendMessage(message.chat.id, "Take your time, wait for the bot to respond to your requests.")
        }
    }
})

CGB__Bot.on("polling_error", (e) => {
    console.error(e.name, e.message)
})