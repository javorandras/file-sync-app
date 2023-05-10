import { Database } from './database';
import { Encryption } from './encrypt';

export class SyncAPI {
    static apiKey: string = "1234";
    static messages: Array<SyncAPI> = new Array<SyncAPI>;

    messages: Record<string, any> | undefined;
    headers: Record<string, any> | undefined;

    receivedApi: string;
    canRespond: boolean = false;

    active_sessions: Map<string, any> = new Map();

    db: Database = new Database("localhost", 3306, "sync-app", "sync-app", "4KA0I6EJA5F_5A1v");

    enc: Encryption = new Encryption("23sYnCaPP20", "*");

    constructor(body: Record<string, any>, headers: Record<string, any>) {
        this.receivedApi = headers["api"];
        this.messages = body;
        this.headers = headers;
        if(this.receivedApi == SyncAPI.apiKey) {
            this.canRespond = true;
        }
    }
    
    async GenerateNewSession(username: string) {
        if(!this.db.has_connected) await this.db.connect();
        if(this.db.has_connected) {
            let results = await this.db.runQuery("SELECT * FROM users WHERE username = ?;", [username]);
            if(results) {
                var rows = JSON.parse(JSON.stringify(results));
                if(rows.length == 1) { 
                    let id: string = this.enc.GenerateRandomString(12);
                    let ts = Date.now()+86400000*7;
                    if(!this.db.has_connected) await this.db.connect();
                    if(this.db.has_connected) {
                        await this.db.runQuery("UPDATE users SET last_login = ?, session_id = ?, session_expiration = ? WHERE username = ?;", [Date.now(), id, ts, username]);
                        this.active_sessions.set(username, {id: id, exp: ts});
                    }
                }
            }
        } 
        return false;
    }
    async TryLogin(user: string, pass: string) {
        if(!this.db.has_connected) await this.db.connect();
        if(this.db.has_connected) {
            let results = await this.db.runQuery("SELECT * FROM users WHERE username = ?;", [user]);
            if(results) {
                var rows = JSON.parse(JSON.stringify(results));
                if(rows.length == 1) {
                    let row: Record<string, string> = rows[0];
                    let pw = row["password"];
                    if(this.enc.Match(pw, pass)) {
                        await this.GenerateNewSession(user); 
                        row.session_id = this.active_sessions.get(user).id;
                        row.password = "PROTECTED";
                        return { code: 0, type: "success", msg: "You logged in successfully.", userdata: row };
                    }
                    return { code: 1, type: "error", msg: "You've used invalid credentials." };
                } else {
                    return { code: 1, type: "error", msg: "User not found."}
                }
            }
            
        }
    }

    async TryRegister(user: string, email: string, pass: string, pass_conf: string) {
        if(!this.db.has_connected) await this.db.connect();
        if(this.db.has_connected) {
            let results = await this.db.runQuery("SELECT * FROM users WHERE username = ?;", [user]);
            if(results) {
                var rows = JSON.parse(JSON.stringify(results));
                if(rows.length == 0) {
                    if(pass == pass_conf) {
                        let pass_enc = this.enc.Encrypt(pass_conf);
                        let ts = Date.now();
                        if(!this.db.has_connected) await this.db.connect();
                        if(this.db.has_connected) {
                            await this.db.runQuery("INSERT INTO users SET username = ?, password = ?, last_login = ?, date_created = ?, email = ?;", [
                                user, pass_enc, ts, ts, email
                            ]);
                        }
                        await this.GenerateNewSession(user);
                        if(!this.db.has_connected) await this.db.connect();
                        if(this.db.has_connected) {
                            let results = await this.db.runQuery("SELECT * FROM users WHERE username = ?;", [user]);
                            if(results) {
                                var rows = JSON.parse(JSON.stringify(results));
                                if(rows.length == 1) {
                                    let row: Record<string, string> = rows[0];
                                    return { code: 0, type: "success", msg: "You successfully registered an account.", userdata: {
                                        id: row.id,
                                        username: user,
                                        password: "PROTECTED",
                                        last_login: ts,
                                        date_created: ts,
                                        email: email, 
                                        session_id: this.active_sessions.get(user).id,
                                        session_expiration: this.active_sessions.get(user).exp,
                                    } }
                                }
                            }
                        }
                        return { code: 1, type: "error", msg: "Something went wrong... Please try again!", }
                    } else {
                        return { code: 1, type: "error", msg: "Password confirmation mismatch.", }
                    }
                }
                return { code: 1, type: "error", msg: "This username's already taken."}
            }
        }
    }

    async Logout(user: string, auto: boolean) {
        if(!auto) {
            this.active_sessions.delete(user);
        }
        return { code: 0, type: "success", msg: "You've been logged out automatically."}
    }

    async ValidateSession(sess_id: string) {
        if(!this.db.has_connected) await this.db.connect();
        if(this.db.has_connected) {
            let results = await this.db.runQuery("SELECT * FROM users WHERE session_id = ?;", [sess_id]);
            if(results) {
                var rows = JSON.parse(JSON.stringify(results));
                if(rows.length == 1) {
                    let row: Record<string, string> = rows[0];
                    row.password = "PROTECTED";
                    return { code: 0, type: "success", msg: "Session validated.", userata: row }
                }
            }
        }
        return { code: 1, type: "error", msg: "This session is not valid anymore." }
    }
}