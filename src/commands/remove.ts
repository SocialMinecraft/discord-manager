import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import protobuf from "protobufjs";
import {nc} from "../index";
import path from "path";

export const data = new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove an account you have registered.")
    .addStringOption((option) => option.setName('minecraft_name').setDescription('Your minecraft username.').setRequired(true));

// TODO - fix the very broken error handling... returning the error does nothing.
export async function execute(interaction: CommandInteraction) {

    // @ts-ignore
    const mc_username = interaction.options.getString('minecraft_name');
    const uid = interaction.member!.user.id;

    let root = new protobuf.Root();
    root.resolvePath = (origin: string, target: string) => {
        const protoDir = "./proto";
        return path.resolve(protoDir, target);
    };
    root.loadSync("minecraft_account/minecraft_account_remove.proto");
    root.loadSync("minecraft_account/minecraft_account_update.proto");
    const reqType = root.lookupType("RemoveMinecraftAccountRequest");
    const resType = root.lookupType("ChangeMinecraftAccountResponse");
    let payload = {
        userId: uid,
        deprecatedMinecraftUsername: mc_username,
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
            flags: MessageFlags.Ephemeral
        });
    } catch (err: any) {
        console.log("NATS error:", err.message);
        return "A system error. Please start a thread in the support channel."
    }

}