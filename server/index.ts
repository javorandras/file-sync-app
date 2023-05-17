import express, { Express, Request, Response } from "express";
import { SyncAPI, StatusCodes } from "./syncapi";
import { Requests } from "./requests";
import bodyParser from "body-parser";

export const Program = {
    port: 7777,
    app: express(),
    debug: true,
    req_per_min: 60,
    req_cooldown: 60*5, // SECONDS
}

Program.app.use(bodyParser.urlencoded({ extended: false }));
Program.app.use(bodyParser.json());

Program.app.listen(Program.port, () => {
    console.log(`[File-SYNC] Now listening on port ${Program.port}`);
});

Program.app.get('/', (req: Request, res: Response) => {
    res.send("<a href='https://github.com/javorandras/file-sync-app' target='_blank'>Github Repo</a>");
});

let api = new SyncAPI();
Requests.api = api;

Program.app.post('/api/messages', async (req: Request, res: Response) => await Requests.sessionRequest(req, res, (async () => {
    let msg = { code: StatusCodes.msg_received, type: "success", msg: "Received." }
    res.send(msg);
    if (Program.debug) {
        console.log(`Success Response to: ${req.ip}`);
        console.log(msg);
    }
})));

Program.app.post('/api/login', async (req: Request, res: Response) => Requests.fieldCheckRequest(req, res, [], ["username", "password"], async (req: Request, res: Response) => {
    let status = await api.TryLogin(req.body.username, req.body.password);
    res.status(200).send(status);
    if (Program.debug) {
        console.log(`Successful Response to: ${req.ip}`);
        console.log(status);
    }
}));

Program.app.post('/api/register', async (req: Request, res: Response) => Requests.fieldCheckRequest(req, res, [], ["username", "email", "password", "password_conf"], async (req: Request, res: Response) => {
    let status = await api.TryRegister(req.body.username, req.body.email, req.body.password, req.body.password_conf);
    res.status(200).send(status);
    if (Program.debug) {
        console.log(`Successful Response to: ${req.ip}`);
        console.log(status);
    }
}));

Program.app.post('/api/logout', async (req: Request, res: Response) => await Requests.fieldCheckRequest(req, res, ["session_id"], [], (async (req: Request, res: Response) => Requests.sessionRequest(req, res, async (req: Request, res: Response) => {
    let status = await api.Logout(req.body.session_id);
    res.status(200).send(status);
    if (Program.debug) {
        console.log(`Successful Response to: ${req.ip}`);
        console.log(status);
    }
}))));

Program.app.post('/api/checkSession', async (req: Request, res: Response) => await Requests.fieldCheckRequest(req, res, ["session_id"], [], (async (req: Request, res: Response) => Requests.sessionRequest(req, res, async (req: Request, res: Response) => {
    let headers: Record<string, any> = req.headers;
    let session_id = headers.session_id;
    let msg = await api.ValidateSession(session_id);
    res.status(200).send(msg);
    if (Program.debug) {
        console.log(`Successful Response to: ${req.ip}`);
        console.log(msg);
    }
}))));



