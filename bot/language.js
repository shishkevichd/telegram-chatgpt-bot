import Config from "./config.js";
import fs from "fs";

export default class Language {
    // Variable that return JSON with translated strings
    static EnglishLanguageFile = JSON.parse(
        fs.readFileSync(`./bot/langs/en.json`)
    )
    static LanguageFile = JSON.parse(
        fs.readFileSync(`./bot/langs/${Language.getCurrentLanguage()}.json`)
    )

    // Function that return current language taken from config
    static getCurrentLanguage() {
        return Config().options.language
    }

    // Function that return translated string
    static translate(name) {
        return this.LanguageFile[name] == undefined
            ? this.EnglishLanguageFile[name]
            : this.LanguageFile[name]
    }
}