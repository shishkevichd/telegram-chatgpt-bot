import fs from "fs";

// Function that return config JSON
export function Config() {
    return JSON.parse(
        fs.readFileSync("./chatgptbot.config.json")
    )
}

// Function that return user settings JSON
export function UserSettings() {
    const userSettingsFile = "./config/users.json"

    if (fs.existsSync(userSettingsFile)) {
        return JSON.parse(
            fs.readFileSync(userSettingsFile)
        )
    } else {
        fs.mkdirSync("./config")

        fs.writeFileSync(userSettingsFile, JSON.stringify(
            {
                users: []
            }
        ))

        return JSON.parse(
            fs.readFileSync(userSettingsFile)
        )
    }
}