import fs from "fs";

// Function that return config JSON
export default function Config() {
    return JSON.parse(
        fs.readFileSync("./chatgptbot.config.json")
    )
}