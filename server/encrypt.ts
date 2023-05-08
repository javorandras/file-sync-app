import crypto from 'crypto';

export class Encryption {

    salt: string = "";
    separator: string = "";

    constructor(salt: string, separator: string) {
        this.salt = salt;
        this.separator = separator;
    }

    GenerateRandomString(len: number = 10) {
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

    Encrypt(data: string, key: string | boolean = false) {
        if(!key) {
            key = this.GenerateRandomString();
        }
        return `${key}${this.separator}${crypto.createHash('sha256').update(key+this.salt+data+this.salt+key).digest('hex')}`;
    }

    Match(encrypted: string, raw: string) {
        let split = encrypted.split('*');
        if(split.length > 1) {
            let key = split[0];
            let hash = this.Encrypt(raw, key);
            return hash == encrypted;
        } 
        return false;
    }
}