"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncAPI = void 0;
const database_1 = require("./database");
class SyncAPI {
    constructor(body, headers) {
        this.canRespond = false;
        this.db = new database_1.Database("localhost", 3306, "sync-app", "sync-app", "4KA0I6EJA5F_5A1v");
        this.receivedApi = headers["api"];
        this.messages = body;
        this.headers = headers;
        if (this.receivedApi == SyncAPI.apiKey) {
            this.canRespond = true;
        }
    }
    TryLogin(user, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.connect();
            if (this.db.has_connected) {
                let results = yield this.db.runQuery("SELECT * FROM users WHERE username = ?;", [user]);
                if (results.length == 1) {
                    let row = results[0];
                    return { code: 0, type: "success", msg: "User is in the database.", userdata: row };
                }
                else {
                    return { code: 1, type: "error", msg: "User not found." };
                }
            }
        });
    }
}
SyncAPI.apiKey = "1234";
SyncAPI.messages = new Array;
exports.SyncAPI = SyncAPI;
