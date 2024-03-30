import * as validators from "./validators";
var protobuf = require("protobufjs");
import {nc} from "../index";

export async function addMinecraftAccount(userId: string, first_name: string, mc_name: string ) {

    if (!validators.isValidMinecraftName(mc_name)) {
        return 'Please double check your minecraft name and then try again. Minecraft names are between 3 and 16 characters and are made up of only letters and numbers.';
    }

    let root = protobuf.loadSync("./proto/accounts.proto");
    const reqType = root.lookupType("AddMinecraftAccountRequest");
    const resType = root.lookupType("ChangeMinecraftAccountResponse");
    let payload = {
        userId: userId,
        firstName: first_name,
        minecraftUsername: mc_name,
    }
    const errMsg = reqType.verify(payload);
    if (errMsg) {
        console.log(errMsg);
        return "Unknown error. Please start a thread in the support channel."
    }
    const message = reqType.create(payload);
    const buffer = reqType.encode(message).finish();

    try {
        let res = await nc.request("accounts.minecraft.add", buffer, {
            timeout: 1000 * 2.5
        });
        let resBody = resType.decode(res.data);
        //console.log(resBody.success, resBody.errorMessage);
        if (!resBody.success) {
            if (resBody.errorMessage.length > 0) {
                return resBody.errorMessage
            } else {
                return "Unknown error. Please start a thread in the support channel."
            }
        }
    } catch (err: any) {
        console.log("NATS error:", err.message);
        return "A system error. Please start a thread in the support channel."
    }

    return "";
}