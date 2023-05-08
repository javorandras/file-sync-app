import mysql, { MysqlError } from "mysql";
// 4KA0I6EJA5F_5A1v
export class Database {
    host: string = "localhost";
    port: number = 3306;
    database: string;
    private username: string;
    private password: string;

    has_connected: boolean = false;
    connection: mysql.Connection | undefined;
   

    constructor(host: string, port: number, database: string, username: string, password: string) {
        this.host = host;
        this.port = port;
        this.database = database;
        this.username = username;
        this.password = password;
    }

    
    async connect() {
        return new Promise<mysql.Connection>((resolve, reject) => {
            const connection = mysql.createConnection({
                user: this.username,
                password: this.password,
                host: this.host,
                database: this.database
            });
            connection.connect((error) => {
                if(error) {
                    reject(error);
                    return;
                }
                this.has_connected = true;
                resolve(connection); 
            })
        }).then((conn: mysql.Connection) => {
            this.connection = conn;
            console.log("MySql successfully connected.");
        }).catch((error: MysqlError) => {
            console.log(error);
        });
    }

    async runQuery(query: string, params: Array<string | number | boolean>) {
        return new Promise<mysql.Connection>((resolve, reject) => {
            if(this.has_connected) {
                this.connection?.query(query, params, (error, result) => {
                    if(error) {
                        reject(error);
                        return;
                    }
                    resolve(result);
                });
            } else {
                throw new Error("You'll need establish a connection first.");
            } 
        }).finally(() => {
            if(this.has_connected) {
                this.connection?.end();
            }
        })
    }
}