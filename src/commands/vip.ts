import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import protobuf from "protobufjs";
import {nc} from "../index";

export const data = new SlashCommandBuilder()
    .setName("vip")
    .setDescription("View your vip status.");

export async function execute(interaction: CommandInteraction) {
    const uid = interaction.member!.user.id;

    let root = protobuf.loadSync("./proto/vip/get.proto");
    const reqType = root.lookupType("GetRequest");
    const resType = root.lookupType("GetResponse");
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
        let res = await nc.request("vip.get", buffer, {
            timeout: 1000 * 2
        });
        let resBody = resType.decode(res.data);

        // @ts-ignore
        if (!resBody.hasMembership) {
            // @ts-ignore
            await sendResponse(interaction, "No membership found.");
            return;
        }

        // build resp
        // @ts-ignore
        const details = resBody.membership;
        let msg = "Email: " + details.email + "\n"
        msg += "Membership signup: " + new Date(details.start*1000).toDateString() + "\n"
        msg += "Membership expires: " + new Date(details.expire*1000).toDateString() + ""

        await sendResponse(interaction, msg)
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
        ephemeral: true,
    });
}