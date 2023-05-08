"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Encryption = void 0;
const crypto_1 = __importDefault(require("crypto"));
class Encryption {
    constructor(salt, separator) {
        this.salt = "";
        this.separator = "";
        this.salt = salt;
        this.separator = separator;
    }
    GenerateRandomString(len = 10) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < len) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }
    Encrypt(data, key = false) {
        if (!key) {
            key = this.GenerateRandomString();
        }
        return `${key}${this.separator}${crypto_1.default.createHash('sha256').update(key + this.salt + data + this.salt + key).digest('hex')}`;
    }
    Match(encrypted, raw) {
        let split = encrypted.split('*');
        if (split.length > 1) {
            let key = split[0];
            let hash = this.Encrypt(raw, key);
            return hash == encrypted;
        }
        return false;
    }
}
exports.Encryption = Encryption;
