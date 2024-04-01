import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import protobuf from "protobufjs";
import {nc} from "../index";

export const data = new SlashCommandBuilder()
    .setName("vipclaim")
    .setDescription("Claim VIP status after you have purchased it.")
    .addStringOption((option) => option.setName('email').setDescription('Email used to purchase membership.').setRequired(true));

export async function execute(interaction: CommandInteraction) {
    const uid = interaction.member!.user.id;
    // @ts-ignore
    let email = interaction.options.getString("email")

    let root = protobuf.loadSync("./proto/vip/claim.proto");
    const reqType = root.lookupType("ClaimRequest");
    const resType = root.lookupType("ClaimResponse");
    let payload = {
        userId: uid,
        email: email,
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
        let res = await nc.request("vip.claim", buffer, {
            timeout: 1000 * 2
        });
        let resBody = resType.decode(res.data);

        // @ts-ignore
        if (!resBody.success) {
            // @ts-ignore
            await sendResponse(interaction, resBody.errorMessage);
            return;
        }

        await sendResponse(interaction, "Success! VIP claimed!")
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