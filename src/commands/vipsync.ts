import {CommandInteraction, MessageFlags, SlashCommandBuilder} from "discord.js";
import protobuf from "protobufjs";
import {nc} from "../index";

export const data = new SlashCommandBuilder()
    .setName("vipsync")
    .setDescription("DEBUG: Sync your minecraft accounts to your vip status.");

export async function execute(interaction: CommandInteraction) {
    const uid = interaction.member!.user.id;

    let root = protobuf.loadSync("./proto/vip/sync.proto");
    const reqType = root.lookupType("SyncRequest");
    const resType = root.lookupType("SyncResponse");
    let payload = {
        userId: uid,
    }
    const errMsg = reqType.verify(payload);
    if (errMsg) {
        console.log(errMsg);
        await sendResponse(interaction, "Unknown error. Please start a thread in the support channel.");
        return;
    }
    const message = reqType.create(payload);
    const buffer = reqType.encode(message).finish();

    try {
        let res = await nc.request("vip.sync", buffer, {
            timeout: 1000 * 2
        });
        let resBody = resType.decode(res.data);

        // @ts-ignore
        if (!resBody.success) {
            // @ts-ignore
            await sendResponse(interaction, resBody.errorMessage);
            return;
        }

        await sendResponse(interaction, "Success! Accounts synced.")
        return;
    } catch (err: any) {
        console.log("NATS error:", err.message);
        await sendResponse(interaction, "A system error. Please start a thread in the support channel.")
        return;
    }
}

async function sendResponse(interaction : CommandInteraction, msg: string) {
    await interaction.reply({
        content: msg,
        flags: MessageFlags.Ephemeral
    });
}