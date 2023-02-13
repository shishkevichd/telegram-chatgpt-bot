import fs from "fs";

export default class Language {
  static LanguageFile = JSON.parse(fs.readFileSync(`./bot/jsons/messages.json`));

  // Function that return translated string
  static translate(name) {
    return this.LanguageFile[name];
  }
}
