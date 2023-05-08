import { Database } from './database';

export class SyncAPI {
    static apiKey: string = "1234";
    static messages: Array<SyncAPI> = new Array<SyncAPI>;

    messages: Record<string, any> | undefined;
    headers: Record<string, any> | undefined;

    receivedApi: string;
    canRespond: boolean = false;

    db: Database = new Database("localhost", 3306, "sync-app", "sync-app", "4KA0I6EJA5F_5A1v");

    constructor(body: Record<string, any>, headers: Record<string, any>) {
        this.receivedApi = headers["api"];
        this.messages = body;
        this.headers = headers;
        if(this.receivedApi == SyncAPI.apiKey) {
            this.canRespond = true;
        }
    }

    async TryLogin(user: string, pass: string) {
        await this.db.connect();
        if(this.db.has_connected) {
            let results = await this.db.runQuery("SELECT * FROM users WHERE username = ?;", [user]);
            if(results.length == 1) {
                let row: Record<string, string> = results[0];
                return {code: 0, type: "success", msg: "User is in the database.", userdata: row};
            } else {
                return {code: 1, type: "error", msg: "User not found."}
            }
        }
    }

}