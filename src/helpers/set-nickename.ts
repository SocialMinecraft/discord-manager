import {REST, Routes} from "discord.js";
import {config} from "../config";
import * as validators from "./validators";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

// Will only set the nickname if a valid one is not present. (unless force=true)
export async function execute(interaction: CommandInteraction) {
    const uid = interaction.member!.user.id;
    // @ts-ignore
    const first_name = interaction.options.getString('first_name');
    // @ts-ignore
    const mc_username = interaction.options.getString('minecraft_name');

    // Trim the first name to remove any extra whitespace, should fix any issues
    const trimmedName = first_name?.trim();

    console.log('Extracted and trimmed first_name:', JSON.stringify(trimmedName));
    console.log('Extracted mc_username:', mc_username);

    // Set the user's nickname (if needed).
    // @ts-ignore
    let err = await setNickname(interaction.guildId!, uid, interaction.member!.nickname, trimmedName, mc_username);
    if (err.length > 0) {
        return interaction.reply({
            content: err,
            ephemeral: true,
        });
    }

    // Add the account
    err = await addMinecraftAccount(uid, trimmedName, mc_username);
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
