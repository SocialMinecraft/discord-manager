import {CommandInteraction, MessageFlags, SlashCommandBuilder} from "discord.js";
import protobuf from "protobufjs";
import {nc} from "../index";
import path from "path";

export const data = new SlashCommandBuilder()
    .setName("whois")
    .setDescription("Lookup all minecraft user names for a player.")
    .addUserOption((option) => option.setName('user').setDescription('The user to lookup').setRequired(true));

// TODO - fix the very broken error handling... returning the error does nothing.
export async function execute(interaction: CommandInteraction) {

    let user = interaction.options.getUser("user")
    let uid = user!.id;
    console.log(uid);

    let root = new protobuf.Root();
    root.resolvePath = (origin: string, target: string) => {
        const protoDir = "./proto";
        return path.resolve(protoDir, target);
    };
    root.loadSync("minecraft_account/minecraft_account_list.proto");
    const reqType = root.lookupType("ListMinecraftAccountsRequest");
    const resType = root.lookupType("ListMinecraftAccountsResponse");
    let payload = {
        userId: uid,
    }
    const errMsg = reqType.verify(payload);
    if (errMsg) {
        console.log(errMsg);
        return "Unknown error. Please start a thread in the support channel."
    }
    const message = reqType.create(payload);
    const buffer = reqType.encode(message).finish();

    try {
        let res = await nc.request("accounts.minecraft.list", buffer, {
            timeout: 1000 * 2
        });
        let resBody = resType.decode(res.data);

        // build resp
        // @ts-ignore
        let accounts = resBody.accounts;
        let msg = `${user?.displayName} has ${accounts.length} Account${accounts.length > 0 ? "s" : ""}:`;
        for (let account of accounts ) {
            msg += `\n\t${account.minecraftUsername}`;
            if (account.isMain)
                msg += ` (main)`;
        }
        if (accounts.length == 0)
            msg = "No accounts found for " + user?.displayName;

        return interaction.reply({
            content: msg,
            flags: MessageFlags.Ephemeral
        });
    } catch (err: any) {
        console.log("NATS error:", err.message);
        return "A system error. Please start a thread in the support channel."
    }
}