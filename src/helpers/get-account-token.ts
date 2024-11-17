var protobuf = require("protobufjs");
import {nc} from "../index";
import * as path from 'path';

export async function getAccountAccessToken(accountId: string) : Promise<[string, string]> {

    let root = new protobuf.Root();
    root.resolvePath = (origin: string, target: string) => {
        const protoDir = "./proto";
        return path.resolve(protoDir, target);
    };
    root.loadSync("account_access/account_access_create.proto");
    const reqType = root.lookupType("CreateAccountAccessToken");
    const resType = root.lookupType("CreateAccountAccessTokenResponse");
    let payload = {
        accountId: accountId,
    }
    const errMsg = reqType.verify(payload);
    if (errMsg) {
        console.log(errMsg);
        return ["", "Unknown error. Please start a thread in the support channel."];
    }
    const message = reqType.create(payload);
    const buffer = reqType.encode(message).finish();

    try {
        let res = await nc.request("accounts.access.create", buffer, {
            timeout: 1000 * 2.5
        });
        let resBody = resType.decode(res.data);
        if (resBody.token == undefined || resBody.token == null || resBody.token.trim() == "") {
            return ["", "Could not create access token."];
        }
        return [resBody.token, ""];
    } catch (err: any) {
        console.log("NATS error:", err.message);
        return ["", "A system error. Please start a thread in the support channel."];
    }
    //return "";
}