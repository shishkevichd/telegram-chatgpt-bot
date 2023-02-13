import { UserSettings as US } from "./config.js";
import fs from "fs";

export default class UserSettings {
  // Getting user settings JSON (USJ)
  static config = US();

  // Function that write changes in USJ
  static syncChanges() {
    fs.writeFileSync("./config/users.json", JSON.stringify(this.config));
  }

  // Function that check if user exists in USJ
  static isUserExists(userId) {
    const result = this.config.users.filter((user) => {
      return user.id == userId;
    });

    return result.length > 0;
  }

  // Function that create new user record in USJ if user not exists
  static createUserRecord(userId) {
    if (!this.isUserExists(userId)) {
      this.config.users.push({
        id: userId,
      });
    }

    this.syncChanges();
  }

  // Function that return all user settings
  static getUserSettings(userId) {
    this.createUserRecord(userId);

    const result = this.config.users.filter((user) => {
      return user.id == userId;
    });

    return result[0];
  }

  // Function that return user setting value
  static getSetting(userId, setting) {
    return this.getUserSettings(userId)[setting];
  }

  // Function that edit user setting value
  static editSetting(userId, setting, value) {
    const userIndex = this.config.users.findIndex((user) => user.id == userId);

    this.config.users[userIndex][setting] = value;

    this.syncChanges();
  }
}
