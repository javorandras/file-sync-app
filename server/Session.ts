import { Database } from './Database';
import { Encryption } from './Encryption';

export const StatusCodes = {
    logged_in: 0,
    usr_taken: 1,
    invalid_cred: 2,
    usr_not_found: 3,
    registered: 4,
    reg_smth_wrong: 5,
    pw_conf_mismatch: 6,
    logged_out: 7,
    logout_fail: 8,
    sess_valid: 9,
    sess_invalid: 10,
    msg_received: 11,
    invalid_req: 12,
    poor_password: 13,
    invalid_email: 14,
};

export const DatabaseCredentials = {
    host: "localhost",
    username: "sync-app",
    database: "sync-app",
    password: "4KA0I6EJA5F_5A1v",
    port: 3306,
};
const dbconf = DatabaseCredentials;

export const EncryptionCredentials = {
    salt: "23sYnCaPP20",
    separator: "*",
};

export class Session {
    static ActiveSessions: Map<string, number> = new Map<string, number>();

    db: Database;
    enc: Encryption;

    constructor() {
        this.db = new Database(dbconf.host, dbconf.port, dbconf.database, dbconf.username, dbconf.password);
        this.enc = new Encryption(EncryptionCredentials.salt, EncryptionCredentials.separator);
    }

    static isValidEmail(email: string): boolean {
        const emailRegex = /\S+@\S+\.\S+/;
        return emailRegex.test(email);
    }

    static checkPassword(password: string): boolean {
        if (password.length < 5) {
            return false;
        }
        const uppercaseRegex = /[A-Z]/;
        if (!uppercaseRegex.test(password)) {
            return false;
        }
        return true;
    }

    async GenerateNewSession(user_id: number) {
        await this.db.runQuery("DELETE FROM active_sessions WHERE expiration <= ?;", [new Date().getTime()]);
        let id: string = this.enc.GenerateRandomString(12);
        while (Session.ActiveSessions.has(id)) {
            id = this.enc.GenerateRandomString(12);
        }
        let exp: number = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);
        await this.db.runQuery("INSERT INTO active_sessions SET user_id = ?, session = ?, expiration = ?;", [user_id, id, exp]);
        await this.db.runQuery("UPDATE users SET last_login = ? WHERE id = ?;", [new Date().getTime(), user_id]);
        Session.ActiveSessions.set(id, exp);
        return { id: id, expiration: exp };
    }

    async TryLogin(user: string, pass: string) {
        let results = await this.db.runQuery("SELECT * FROM users WHERE username = ?;", [user]);
        if (results) {
            var rows = JSON.parse(JSON.stringify(results));
            if (rows.length == 1) {
                let row: Record<string, string> = rows[0];
                let pw = row.password;
                if (this.enc.Match(pw, pass)) {
                    let session: Record<string, any> = await this.GenerateNewSession(parseInt(row.id));
                    row.session_id = session.id.toString();
                    row.session_expiration = session.expiration.toString();
                    row.last_login = row.last_login.toString();
                    row.date_created = row.date_created.toString();
                    row.password = "PROTECTED";
                    return { code: StatusCodes.logged_in, type: "success", msg: "You logged in successfully.", userdata: row };
                }
                return { code: StatusCodes.invalid_cred, type: "error", msg: "You've used invalid credentials." };
            } else {
                return { code: StatusCodes.usr_not_found, type: "error", msg: "User not found." }
            }
        }
    }

    async TryRegister(user: string, email: string, pass: string, pass_conf: string) {
        let results = await this.db.runQuery("SELECT * FROM users WHERE username = ?;", [user]);
        if (results) {
            var rows = JSON.parse(JSON.stringify(results));
            if (rows.length == 0) {
                if (!Session.isValidEmail(email)) return { code: StatusCodes.invalid_email, type: "error", msg: "The entered email is not valid, please use an existing one.", }
                if (pass == pass_conf) {
                    if (Session.checkPassword(pass)) return { code: StatusCodes.poor_password, type: "error", msg: "Password's too weak. Your password must contain atleast a capital letter and atleast 5 characters long.", }
                    let pass_enc = this.enc.Encrypt(pass_conf);
                    let ts = new Date().getTime();
                    await this.db.runQuery("INSERT INTO users SET username = ?, password = ?, last_login = ?, date_created = ?, email = ?;", [
                        user, pass_enc, ts, ts, email
                    ]);
                    let results = await this.db.runQuery("SELECT * FROM users WHERE username = ?;", [user]);
                    if (results) {
                        var rows = JSON.parse(JSON.stringify(results));
                        if (rows.length == 1) {
                            let row: Record<string, string> = rows[0];
                            let session: Record<string, any> = await this.GenerateNewSession(parseInt(row.id));
                            return {
                                code: StatusCodes.registered, type: "success", msg: "You successfully registered an account.", userdata: {
                                    id: row.id,
                                    username: user,
                                    password: "PROTECTED",
                                    last_login: ts,
                                    date_created: ts,
                                    email: email,
                                    session_id: session.id.toString(),
                                    session_expiration: session.expiration.toString(),
                                }
                            }
                        }
                    }
                    return { code: StatusCodes.reg_smth_wrong, type: "error", msg: "Something went wrong... Please try again!", }
                } else {
                    return { code: StatusCodes.pw_conf_mismatch, type: "error", msg: "Password confirmation mismatch.", }
                }
            }
            return { code: StatusCodes.usr_taken, type: "error", msg: "This username's already taken." }
        }
    }

    async Logout(session: string) {
        await this.db.runQuery("DELETE FROM active_sessions WHERE expiration <= ?;", [new Date().getTime()]);
        await this.db.runQuery("DELETE FROM active_sessions WHERE session = ?;", [session]);
        return { code: StatusCodes.logged_out, type: "success", msg: "You logged out successfully." }
    }

    async ValidateSession(id: string) {
        if(!Session.ActiveSessions.has(id)) {
            let results: Record<any, any> = this.db.runQuery("SELECT * FROM active_sessions WHERE session = ? AND expiration > ?;", [id, new Date().getTime()]);
            return results.length > 0 ? { code: StatusCodes.sess_valid, type: "success", msg: "Session validated." } : { code: StatusCodes.sess_invalid, type: "error", msg: "This session is not valid anymore." };
        } else {
            let expiration = Session.ActiveSessions.get(id);
            if(expiration != undefined && expiration > new Date().getTime()) {
                return { code: StatusCodes.sess_valid, type: "success", msg: "Session validated." };
            }
        }
        return { code: StatusCodes.sess_invalid, type: "error", msg: "This session is not valid anymore." };
    }
}