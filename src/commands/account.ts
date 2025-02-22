import {CommandInteraction, MessageFlags, SlashCommandBuilder} from "discord.js";
import protobuf from "protobufjs";
import {nc} from "../index";
import path from "path";
import {getSomcAccount} from "../helpers/get-somc-account";
import {getAccountAccessToken} from "../helpers/get-account-token";

export const data = new SlashCommandBuilder()
    .setName("account")
    .setDescription("Manage your Social Minecraft account.");


export async function execute(interaction: CommandInteraction) {
    const uid = interaction.member!.user.id;

    // get somc account id
    let [account, error1] = await getSomcAccount(uid);
    if (error1.length > 0) {
        return interaction.reply({
            content: error1,
            flags: MessageFlags.Ephemeral
        });
    }

    // get token account id
    let [token, error2] = await getAccountAccessToken(account.id);
    if (error2.length > 0) {
        return interaction.reply({
            content: error2,
            flags: MessageFlags.Ephemeral
        });
    }

    // Success!
    return interaction.reply({
        content: "You may access your account here: https://account.somc.club/" + token,
        flags: MessageFlags.Ephemeral
    });

}

