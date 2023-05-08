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
const encrypt_1 = require("./encrypt");
class SyncAPI {
    constructor(body, headers) {
        this.canRespond = false;
        this.active_sessions = new Map();
        this.db = new database_1.Database("localhost", 3306, "sync-app", "sync-app", "4KA0I6EJA5F_5A1v");
        this.enc = new encrypt_1.Encryption("23sYnCaPP20", "*");
        this.receivedApi = headers["api"];
        this.messages = body;
        this.headers = headers;
        if (this.receivedApi == SyncAPI.apiKey) {
            this.canRespond = true;
        }
    }
    GenerateNewSession(username) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db.has_connected)
                yield this.db.connect();
            if (this.db.has_connected) {
                let results = yield this.db.runQuery("SELECT * FROM users WHERE username = ?;", [username]);
                if (results) {
                    var rows = JSON.parse(JSON.stringify(results));
                    if (rows.length == 1) {
                        let id = this.enc.GenerateRandomString(12);
                        let ts = Date.now() + 86400000 * 7;
                        if (!this.db.has_connected)
                            yield this.db.connect();
                        if (this.db.has_connected) {
                            yield this.db.runQuery("UPDATE users SET last_login = ?, session_id = ?, session_expiration = ? WHERE username = ?;", [Date.now(), id, ts, username]);
                            this.active_sessions.set(username, { id: id, exp: ts });
                        }
                    }
                }
            }
            return false;
        });
    }
    TryLogin(user, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db.has_connected)
                yield this.db.connect();
            if (this.db.has_connected) {
                let results = yield this.db.runQuery("SELECT * FROM users WHERE username = ?;", [user]);
                if (results) {
                    var rows = JSON.parse(JSON.stringify(results));
                    if (rows.length == 1) {
                        let row = rows[0];
                        let pw = row["password"];
                        if (this.enc.Match(pw, pass)) {
                            yield this.GenerateNewSession(user);
                            row.session_id = this.active_sessions.get(user);
                            return { code: 0, type: "success", msg: "You logged in successfully.", userdata: row };
                        }
                        return { code: 1, type: "error", msg: "You've used invalid credentials." };
                    }
                    else {
                        return { code: 1, type: "error", msg: "User not found." };
                    }
                }
            }
        });
    }
    TryRegister(user, email, pass, pass_conf) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.db.has_connected)
                yield this.db.connect();
            if (this.db.has_connected) {
                let results = yield this.db.runQuery("SELECT * FROM users WHERE username = ?;", [user]);
                if (results) {
                    var rows = JSON.parse(JSON.stringify(results));
                    if (rows.length == 0) {
                        if (pass == pass_conf) {
                            let pass_enc = this.enc.Encrypt(pass_conf);
                            let ts = Date.now();
                            if (!this.db.has_connected)
                                yield this.db.connect();
                            if (this.db.has_connected) {
                                yield this.db.runQuery("INSERT INTO users SET username = ?, password = ?, last_login = ?, date_created = ?, email = ?;", [
                                    user, pass_enc, ts, ts, email
                                ]);
                            }
                            yield this.GenerateNewSession(user);
                            if (!this.db.has_connected)
                                yield this.db.connect();
                            if (this.db.has_connected) {
                                let results = yield this.db.runQuery("SELECT * FROM users WHERE username = ?;", [user]);
                                if (results) {
                                    var rows = JSON.parse(JSON.stringify(results));
                                    if (rows.length == 1) {
                                        let row = rows[0];
                                        return { code: 0, type: "success", msg: "You successfully registered an account.", userdata: {
                                                id: row.id,
                                                username: user,
                                                password: pass_enc,
                                                last_login: ts,
                                                date_created: ts,
                                                email: email,
                                                session_id: this.active_sessions.get(user).id,
                                                session_expiration: this.active_sessions.get(user).exp,
                                            } };
                                    }
                                }
                            }
                            return { code: 1, type: "error", msg: "Something went wrong... Please try again!", };
                        }
                        else {
                            return { code: 1, type: "error", msg: "Password confirmation mismatch.", };
                        }
                    }
                    return { code: 1, type: "error", msg: "This username's already taken." };
                }
            }
        });
    }
    Logout(user, auto) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!auto) {
                this.active_sessions.delete(user);
            }
            return { code: 0, type: "success", msg: "You've been logged out automatically." };
        });
    }
}
SyncAPI.apiKey = "1234";
SyncAPI.messages = new Array;
exports.SyncAPI = SyncAPI;
