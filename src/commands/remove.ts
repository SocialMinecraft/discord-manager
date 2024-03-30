import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import protobuf from "protobufjs";
import {nc} from "../index";

export const data = new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove an account you have registered.")
    .addStringOption((option) => option.setName('minecraft_name').setDescription('Your minecraft username.').setRequired(true));

export async function execute(interaction: CommandInteraction) {

    // @ts-ignore
    const mc_username = interaction.options.getString('minecraft_name');
    const uid = interaction.member!.user.id;

    let root = protobuf.loadSync("../proto/accounts.proto");
    const reqType = root.lookupType("RemoveMinecraftAccountRequest");
    const resType = root.lookupType("ChangeMinecraftAccountResponse");
    let payload = {
        userId: uid,
        minecraftUsername: mc_username,
    }
    const errMsg = reqType.verify(payload);
    if (errMsg) {
        console.log(errMsg);
        return "Unknown error. Please start a thread in the support channel."
    }
    const message = reqType.create(payload);
    const buffer = reqType.encode(message).finish();

    try {
        let res = await nc.request("accounts.minecraft.remove", buffer, {
            timeout: 1000 * 2
        });
        let resBody = resType.decode(res.data);

        let msg = "The account has been removed."
        // @ts-ignore
        if (!resBody.success) {
            // @ts-ignore
            msg = resBody.errorMessage;
        }

        return interaction.reply({
            content: msg,
            ephemeral: true,
        });
    } catch (err: any) {
        console.log("NATS error:", err.message);
        return "A system error. Please start a thread in the support channel."
    }

}