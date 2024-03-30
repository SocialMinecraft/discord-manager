import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import {setNickname} from "../helpers/set-nickename";
import {addMinecraftAccount} from "../helpers/add-minecraft-account";

export const data = new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register your minecraft account to login to the server.")
    .addStringOption((option) => option.setName('first_name').setDescription('What is your first name?').setRequired(true))
    .addStringOption((option) => option.setName('minecraft_name').setDescription('Your minecraft username.').setRequired(true));

export async function execute(interaction: CommandInteraction) {
    //return interaction.reply("Pong!");
    var uid = interaction.member.user.id;
    var first_name = interaction.options.getString('first_name');
    var mc_username = interaction.options.getString('minecraft_name');

    // Set the users nickname (if needed).
    let err = await setNickname(interaction.guildId, uid, interaction.member.nickname, first_name, "TBD");
    if (err.length > 0) {
        return interaction.reply({
            content: err,
            ephemeral: true,
        });
    }

    // Add the account
    err = await addMinecraftAccount(uid, first_name, mc_username);
    if (err.length > 0) {
        return interaction.reply({
            content: err,
            ephemeral: true,
        });
    }

    // Success!
    return interaction.reply({
        content: "Success! Your account has been registered.",
        ephemeral: true,
    });
}