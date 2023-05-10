import express, { Express, Request, Response } from "express";
import { SyncAPI } from "./syncapi";
import bodyParser from "body-parser";
import os from 'os';

const router = express.Router();


import multer from 'multer';
const upload = multer({ dest: os.tmpdir() });


const port: number = 7777;
const app: Express = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(port, () => {
    console.log(`[File-SYNC] Now listening on port ${port}`);
});

app.get('/', (req: Request, res: Response) => {
    res.send("File-Sync Server App - NodeJS");
});

app.post('/api/messages', (req: Request, res: Response) => {
    console.log(req.body);
    let api: SyncAPI = new SyncAPI(req.body, req.headers);
    if (api.canRespond) {
        let msg = { code: 0, type: "success", msg: "Received." }
        res.send(msg);
        console.log(`Success Response to: ${req.ip}`);
        console.log(msg);
    } else {
        let msg = { code: 1, type: "error", msg: "You can't access this without a valid API Key." }
        res.status(403).send(msg);
        console.log(`Failure Response to: ${req.ip}`);
        console.log(msg);
    }
});

app.post('/api/login', async (req: Request, res: Response) => {
    let api: SyncAPI = new SyncAPI(req.body, req.headers);
    if (api.canRespond) {
        let status = await api.TryLogin(req.body.username, req.body.password);
        res.status(200).send(status);
        console.log(`Successful Response to: ${req.ip}`);
        console.log(status);
    } else {
        let msg = { code: 1, type: "error", msg: "You can't access this without a valid API Key." }
        res.status(403).send(msg);
        console.log(`Failure Response to: ${req.ip}`);
        console.log(msg);
    }
});

app.post('/api/register', async (req: Request, res: Response) => {
    let api: SyncAPI = new SyncAPI(req.body, req.headers);
    if (api.canRespond) {
        let status = await api.TryRegister(req.body.username, req.body.email, req.body.password, req.body.password_conf);
        res.status(200).send(status);
        console.log(`Successful Response to: ${req.ip}`);
        console.log(status);
    } else {
        let msg = { code: 1, type: "error", msg: "You can't access this without a valid API Key." }
        res.status(403).send(msg);
        console.log(`Failure Response to: ${req.ip}`);
        console.log(msg);
    }
});

app.post('/api/logout', async (req: Request, res: Response) => {
    let api: SyncAPI = new SyncAPI(req.body, req.headers);
    if (api.canRespond) {
        let status = await api.Logout(req.body.username, true);
        res.status(200).send(status);
        console.log(`Successful Response to: ${req.ip}`);
        console.log(status);
    } else {
        let msg = { code: 1, type: "error", msg: "You can't access this without a valid API Key." }
        res.status(403).send(msg);
        console.log(`Failure Response to: ${req.ip}`);
        console.log(msg);
    }
});

app.post('/api/checkSession', async (req: Request, res: Response) => { 
    let api: SyncAPI = new SyncAPI(req.body, req.headers);
    if (api.canRespond) {
        let session_id = req.body.session_id;
        let msg = await api.ValidateSession(session_id);
        res.status(200).send(msg);
        console.log(`Successful Response to: ${req.ip}`);
        console.log(msg);
    } else {
        let msg = { code: 1, type: "error", msg: "You can't access this without a valid API Key." }
        res.status(403).send(msg);
        console.log(`Failure Response to: ${req.ip}`);
        console.log(msg);
    }
});