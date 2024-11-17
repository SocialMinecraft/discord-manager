var protobuf = require("protobufjs");
import {nc} from "../index";
import * as path from 'path';

export async function getSomcAccount(discordId: string) : Promise<[any, string]> {

    let root = new protobuf.Root();
    root.resolvePath = (origin: string, target: string) => {
        const protoDir = "./proto";
        return path.resolve(protoDir, target);
    };
    root.loadSync("account/account_get.proto");
    const reqType = root.lookupType("GetAccount");
    const resType = root.lookupType("GetAccountResponse");
    let payload = {
        discordId: discordId,
    }
    const errMsg = reqType.verify(payload);
    if (errMsg) {
        console.log(errMsg);
        return [null, "Unknown error. Please start a thread in the support channel."]
    }
    const message = reqType.create(payload);
    const buffer = reqType.encode(message).finish();

    try {
        let res = await nc.request("accounts.get", buffer, {
            timeout: 1000 * 2.5
        });
        let resBody = resType.decode(res.data);
        if (resBody.account == undefined || resBody.account == null) {
            // create the account instead
            return createAccount(discordId);
        } else {
            return [resBody.account, ""];
        }
    } catch (err: any) {
        console.log("NATS error:", err.message);
        return [null, "A system error. Please start a thread in the support channel."];
    }
    //return "";
}

async function createAccount(discordId: string) : Promise<[any, string]> {

    let root = new protobuf.Root();
    root.resolvePath = (origin: string, target: string) => {
        const protoDir = "./proto";
        return path.resolve(protoDir, target);
    };
    root.loadSync("account/account_create.proto");
    const reqType = root.lookupType("CreateAccount");
    const resType = root.lookupType("CreateAccountResponse");
    let payload = {
        discordId: discordId,
    }
    const errMsg = reqType.verify(payload);
    if (errMsg) {
        console.log(errMsg);
        return [null, "Unknown error. Please start a thread in the support channel."]
    }
    const message = reqType.create(payload);
    const buffer = reqType.encode(message).finish();

    try {
        let res = await nc.request("accounts.create", buffer, {
            timeout: 1000 * 2.5
        });
        let resBody = resType.decode(res.data);
        if (!resBody.success) {
            if (resBody.errorMessage.length > 0) {
                return [null, resBody.errorMessage];
            } else {
                return [null, "Unknown error. Please start a thread in the support channel."];
            }
        }
        return [resBody.account, ""];
    } catch (err: any) {
        console.log("NATS error:", err.message);
        return [null, "A system error. Please start a thread in the support channel."];
    }
    //return "";
}