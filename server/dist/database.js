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
exports.Database = void 0;
const mysql_1 = __importDefault(require("mysql"));
// 4KA0I6EJA5F_5A1v
class Database {
    constructor(host, port, database, username, password) {
        this.host = "localhost";
        this.port = 3306;
        this.has_connected = false;
        this.host = host;
        this.port = port;
        this.database = database;
        this.username = username;
        this.password = password;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const connection = mysql_1.default.createConnection({
                    user: this.username,
                    password: this.password,
                    host: this.host,
                    database: this.database
                });
                connection.connect((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    this.has_connected = true;
                    resolve(connection);
                });
            }).then((conn) => {
                this.connection = conn;
                console.log("MySql successfully connected.");
            }).catch((error) => {
                console.log(error);
            });
        });
    }
    runQuery(query, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var _a;
                if (this.has_connected) {
                    (_a = this.connection) === null || _a === void 0 ? void 0 : _a.query(query, params, (error, result) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(result);
                    });
                }
                else {
                    throw new Error("You'll need establish a connection first.");
                }
            }).finally(() => {
                var _a;
                if (this.has_connected) {
                    (_a = this.connection) === null || _a === void 0 ? void 0 : _a.end();
                }
            });
        });
    }
}
exports.Database = Database;
