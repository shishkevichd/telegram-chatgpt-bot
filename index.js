import TelegramBot from "node-telegram-bot-api";
import { ChatGPTAPI } from "chatgpt";

import Helper from "./bot/helper.js";
import Config from "./bot/config.js";
import IncomingRequests from "./bot/incomings.js";
import Language from "./bot/language.js";

// -=-=-=-=-=-
// Setting bot
// -=-=-=-=-=-

const CGB__Config = Config()

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
// Handle actions
// -=-=-=-=-=-

// Handle on actions in groups and channels
CGB__Bot.on("supergroup_chat_created", (message) => {
    CGB__Bot.sendMessage(message.chat.id, Language.translate("botWorksOnPrivateMessage"))
    CGB__Bot.leaveChat(message.chat.id)
})
CGB__Bot.on("channel_chat_created", (message) => {
    CGB__Bot.sendMessage(message.chat.id, Language.translate("botWorksOnPrivateMessage"))
    CGB__Bot.leaveChat(message.chat.id)
})
CGB__Bot.on("group_chat_created", (message) => {
    CGB__Bot.sendMessage(message.chat.id, Language.translate("botWorksOnPrivateMessage"))
    CGB__Bot.leaveChat(message.chat.id)
})

// Handle on /start command
CGB__Bot.onText(/\/start/, (message) => {
    if (message.chat.type == "private") {
        // Check if user is allowed
        if (Helper.isUserAllowedToWrite(message.from.id)) {
            // Send message
            CGB__Bot.sendMessage(message.chat.id, Language.translate("startMessage"))
        }
    }
})

// Handle on questions
CGB__Bot.onText(/([a-zA-Z0-9а-яА-Я_]+)([\W+^\s])/g, (message) => {
    // Check if chat type is private
    if (message.chat.type == "private") {
        // Check if user is allowed
        if (Helper.isUserAllowedToWrite(message.from.id)) {
            // Check if incoming requests >= maximal incoming requests
            if (Helper.getIncomingRequestCountsById(message.from.id) < CGB__Config.options.maxIncomingRequests) {
                // Check if message is not command
                if (!message.text.startsWith("/")) {

                    // Add incoming request
                    const generatedMessageId = Helper.generateId()
                    IncomingRequests.addIncomingRequest(
                        {
                            id: message.from.id,
                            code: generatedMessageId
                        }
                    )

                    CGB__Bot.sendMessage(message.chat.id, Language.translate("messageWaiting")).then((secondMessage) => {
                        CGB__Api.sendMessage(message.text).then((response) => {
                            // Send reply message
                            CGB__Bot.sendMessage(secondMessage.chat.id, Helper.convertToNormalText(response.text), {
                                reply_to_message_id: message.message_id,
                            }).then(() => {
                                // If send message is success, delete second message
                                CGB__Bot.deleteMessage(secondMessage.chat.id, secondMessage.message_id)
                            }).catch(() => {
                                // If send message is fail, edit second message
                                CGB__Bot.editMessageText(Helper.convertToNormalText(response.text), {
                                    message_id: secondMessage.message_id,
                                    chat_id: secondMessage.chat.id,
                                })
                            })

                            // Remove incoming request
                            IncomingRequests.deleteIncomingRequest(generatedMessageId)
                        })
                    }).catch((reason) => {
                        CGB__Bot.sendMessage(message.chat.id, Language.translate("errorMessage"))
                    })
                }
            } else {
                CGB__Bot.sendMessage(message.chat.id, Language.translate("takeTimeMessage"))
            }
        }
    }
})