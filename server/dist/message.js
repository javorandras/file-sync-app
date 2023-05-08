"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncAPI = void 0;
class SyncAPI {
    constructor(body, headers) {
        this.canRespond = false;
        this.receivedApi = headers["api"];
        this.messages = body;
        this.headers = headers;
        if (this.receivedApi == SyncAPI.apiKey) {
            this.canRespond = true;
        }
        // console.log(this.toString());
    }
    toString() {
        return `API: ${SyncAPI.apiKey}\n` +
            `Received API: ${this.receivedApi}\n` +
            `Is Matching? ${this.receivedApi == SyncAPI.apiKey}`;
    }
}
SyncAPI.apiKey = "1234";
SyncAPI.messages = new Array;
exports.SyncAPI = SyncAPI;
