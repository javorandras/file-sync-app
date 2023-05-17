import express, { Express, Request, Response } from "express";
import { Session, StatusCodes } from "./Session";
import { Requests } from "./Requests";
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

let session = new Session();
Requests.session = session;

Program.app.post('/api/messages', async (req: Request, res: Response) => await Requests.sessionRequest(req, res, (async () => {
    let msg = { code: StatusCodes.msg_received, type: "success", msg: "Received." }
    res.send(msg);
    if (Program.debug) {
        console.log(`Success Response to: ${req.ip}`);
        console.log(msg);
    }
})));

Program.app.post('/api/login', async (req: Request, res: Response) => Requests.fieldCheckRequest(req, res, [], ["username", "password"], async (req: Request, res: Response) => {
    let status = await session.TryLogin(req.body.username, req.body.password);
    res.status(200).send(status);
    if (Program.debug) {
        console.log(`Successful Response to: ${req.ip}`);
        console.log(status);
    }
}));

Program.app.post('/api/register', async (req: Request, res: Response) => Requests.fieldCheckRequest(req, res, [], ["username", "email", "password", "password_conf"], async (req: Request, res: Response) => {
    let status = await session.TryRegister(req.body.username, req.body.email, req.body.password, req.body.password_conf);
    res.status(200).send(status);
    if (Program.debug) {
        console.log(`Successful Response to: ${req.ip}`);
        console.log(status);
    }
}));

Program.app.post('/api/logout', async (req: Request, res: Response) => await Requests.fieldCheckRequest(req, res, ["session_id"], [], (async (req: Request, res: Response) => Requests.sessionRequest(req, res, async (req: Request, res: Response) => {
    let status = await session.Logout(req.body.session_id);
    res.status(200).send(status);
    if (Program.debug) {
        console.log(`Successful Response to: ${req.ip}`);
        console.log(status);
    }
}))));

Program.app.post('/api/checkSession', async (req: Request, res: Response) => await Requests.fieldCheckRequest(req, res, ["session_id"], [], (async (req: Request, res: Response) => Requests.sessionRequest(req, res, async (req: Request, res: Response) => {
    let headers: Record<string, any> = req.headers;
    let session_id = headers.session_id;
    let msg = await session.ValidateSession(session_id);
    res.status(200).send(msg);
    if (Program.debug) {
        console.log(`Successful Response to: ${req.ip}`);
        console.log(msg);
    }
}))));



