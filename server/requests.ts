import { Request, Response } from "express";
import { SyncAPI, StatusCodes } from "./syncapi";
import { Program } from "./index";

export class Requests {
    static api?: SyncAPI;

    static requestBlacklist: Map<string, number> = new Map<string, number>();
    static requestChecker: Map<string, {}> = new Map<string, {}>();

    static rejectedSessionRequest = (req: Request, res: Response, replacement: Function | undefined): void => {
        try {
            if(Requests.requestBlacklist.has(req.ip)) {
                let blacklistTs: number = Requests.requestBlacklist.get(req.ip)!;
                if(blacklistTs > new Date().getTime()) {
                    req.destroy();
                    return;
                } else {
                    Requests.requestBlacklist.delete(req.ip);
                }
            } 
            if(!Requests.requestChecker.has(req.ip)) {
                Requests.requestChecker.set(req.ip, {requests: 1, last_req: new Date().getTime()});
            } else {
                let requestData: Record<string, any> = Requests.requestChecker.get(req.ip)!;
                if(requestData.requests < Program.req_per_min) {
                    requestData.requests = requestData.requests + 1;
                    requestData.last_req = new Date().getTime();
                    Requests.requestChecker.set(req.ip, requestData);
                } else {
                    if(new Date().getTime() - requestData.last_req <= 60000) {
                        req.destroy();
                        Requests.requestChecker.delete(req.ip);
                        Requests.requestBlacklist.set(req.ip, new Date().getTime() + (Program.req_cooldown*1000));
                        return;
                    } else {
                        Requests.requestChecker.delete(req.ip);
                    }
                }
            }
            if (replacement != undefined) {
                replacement(req, res);
                return;
            }
            res.status(403).send({ code: StatusCodes.sess_invalid, type: "error", msg: "Your request was rejected because your session is invalid." });
        } catch(error) {
            console.log(`rejectedSessionRequest error: \n${error}`)
        }
    }

    static badRequest = (req: Request, res: Response) => {
        try {
            if(Requests.requestBlacklist.has(req.ip)) {
                let blacklistTs: number = Requests.requestBlacklist.get(req.ip)!;
                if(blacklistTs > new Date().getTime()) {
                    req.destroy();
                    return;
                } else {
                    Requests.requestBlacklist.delete(req.ip);
                }
            } 
            if(!Requests.requestChecker.has(req.ip)) {
                Requests.requestChecker.set(req.ip, {requests: 1, last_req: new Date().getTime()});
            } else {
                let requestData: Record<string, any> = Requests.requestChecker.get(req.ip)!;
                if(requestData.requests < Program.req_per_min) {
                    requestData.requests = requestData.requests + 1;
                    requestData.last_req = new Date().getTime();
                    Requests.requestChecker.set(req.ip, requestData);
                } else {
                    if(new Date().getTime() - requestData.last_req <= 60000) {
                        req.destroy();
                        Requests.requestChecker.delete(req.ip);
                        Requests.requestBlacklist.set(req.ip, new Date().getTime() + (Program.req_cooldown*1000));
                        return;
                    } else {
                        Requests.requestChecker.delete(req.ip);
                    }
                }
            }
            if (Program.debug) res.status(400).send({ code: StatusCodes.invalid_req, type: "error", msg: "Your request was rejected because your request is invalid." });
        } catch(error) {
            if(Program.debug) {
                console.log(`badRequest error: \n${error}`);
            }
            req.destroy();
        }
    }

    static sessionRequest = async (req: Request, res: Response, callback: Function | undefined): Promise<void> => {
        try {
            if(Requests.requestBlacklist.has(req.ip)) {
                let blacklistTs: number = Requests.requestBlacklist.get(req.ip)!;
                if(blacklistTs > new Date().getTime()) {
                    req.destroy();
                    return;
                } else {
                    Requests.requestBlacklist.delete(req.ip);
                }
            } 
            if(!Requests.requestChecker.has(req.ip)) {
                Requests.requestChecker.set(req.ip, {requests: 1, last_req: new Date().getTime()});
            } else {
                let requestData: Record<string, any> = Requests.requestChecker.get(req.ip)!;
                if(requestData.requests < Program.req_per_min) {
                    requestData.requests = requestData.requests + 1;
                    requestData.last_req = new Date().getTime();
                    Requests.requestChecker.set(req.ip, requestData);
                } else {
                    if(new Date().getTime() - requestData.last_req <= 60000) {
                        req.destroy();
                        Requests.requestChecker.delete(req.ip);
                        Requests.requestBlacklist.set(req.ip, new Date().getTime() + (Program.req_cooldown*1000));
                        return;
                    } else {
                        Requests.requestChecker.delete(req.ip);
                    }
                }
            }
            let headers: Record<any, any> = req.headers;
            let session_id = headers.session;
            let status = await Requests.api?.ValidateSession(session_id);
            if (status && callback != undefined) {
                callback(req, res);
                return;
            }
            Requests.rejectedSessionRequest(req, res, undefined);
        } catch(error) {
            if(Program.debug) {
                Requests.badRequest(req, res);
                console.log(`sessionRequest error: \n${error}`);
            }
        }
    }

    static fieldCheckRequest = async (req: Request, res: Response, header_fields: Array<string>, body_fields: Array<string>, callback: Function | undefined) => {
        try {
            if(Requests.requestBlacklist.has(req.ip)) {
                let blacklistTs: number = Requests.requestBlacklist.get(req.ip)!;
                if(blacklistTs > new Date().getTime()) {
                    req.destroy();
                    return;
                } else {
                    Requests.requestBlacklist.delete(req.ip);
                }
            } 
            if(!Requests.requestChecker.has(req.ip)) {
                Requests.requestChecker.set(req.ip, {requests: 1, last_req: new Date().getTime()});
            } else {
                let requestData: Record<string, any> = Requests.requestChecker.get(req.ip)!;
                if(requestData.requests < Program.req_per_min) {
                    requestData.requests = requestData.requests + 1;
                    requestData.last_req = new Date().getTime();
                    Requests.requestChecker.set(req.ip, requestData);
                } else {
                    if(new Date().getTime() - requestData.last_req <= 60000) {
                        Requests.requestChecker.delete(req.ip);
                        Requests.requestBlacklist.set(req.ip, new Date().getTime() + (Program.req_cooldown*1000));
                        req.destroy();
                        return;
                    } else {
                        Requests.requestChecker.delete(req.ip);
                    }
                }
            }
            for (let i = 0; i < header_fields.length; i++) {
                if (req.get(header_fields[i]) == undefined) {
                    Requests.badRequest(req, res);
                    return;
                }
            }
            for (let j = 0; j < body_fields.length; j++) {
                if (req.body[body_fields[j]] == undefined) {
                    Requests.badRequest(req, res);
                    return;
                }
            }
            if (callback != undefined) callback(req, res);
        } catch(error) {
            if(Program.debug) {
                Requests.badRequest(req, res);
                console.log(`fieldCheckRequest error: \n${error}`);
            }
        }
    }
}