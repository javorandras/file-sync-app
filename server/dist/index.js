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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const syncapi_1 = require("./syncapi");
const body_parser_1 = __importDefault(require("body-parser"));
const port = 7777;
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.listen(port, () => {
    console.log(`[File-SYNC] Now listening on port ${port}`);
});
app.get('/', (req, res) => {
    res.send("File-Sync Server App - NodeJS");
});
app.post('/api/messages', (req, res) => {
    console.log(req.body);
    let api = new syncapi_1.SyncAPI(req.body, req.headers);
    if (api.canRespond) {
        let msg = { code: 0, type: "success", msg: "Received." };
        res.send(msg);
        console.log(`Success Response to: ${req.ip}`);
        console.log(msg);
    }
    else {
        let msg = { code: 1, type: "error", msg: "You can't access this without a valid API Key." };
        res.status(403).send(msg);
        console.log(`Failure Response to: ${req.ip}`);
        console.log(msg);
    }
});
app.post('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let api = new syncapi_1.SyncAPI(req.body, req.headers);
    if (api.canRespond) {
        let status = yield api.TryLogin(req.body.username, req.body.password);
        res.status(200).send(status);
        console.log(`Success Response to: ${req.ip}`);
        console.log(status);
    }
    else {
        let msg = { code: 1, type: "error", msg: "You can't access this without a valid API Key." };
        res.status(403).send(msg);
        console.log(`Failure Response to: ${req.ip}`);
        console.log(msg);
    }
}));
