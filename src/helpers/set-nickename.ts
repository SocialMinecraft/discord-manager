import { REST, Routes } from "discord.js";
import { config } from "../config";
import * as validators from "./validators";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

export async function setNickname(
    guild_id: string,
    member_id: string,
    current_nick: string | null,
    first_name: string,
    mc_name: string
) {
    // Trim the first_name to remove any extra whitespace
    const trimmedFirstName = first_name?.trim();

    // Log to verify the trimmed name
    console.log('Trimmed first_name:', JSON.stringify(trimmedFirstName));

    // Check if the user already has a valid Discord nickname and this is not a forced update
    if (current_nick != null && validators.isValidDiscordName(current_nick)) {
        return "";
    }

    // Validate the trimmed first name
    if (!validators.isValidFirstName(trimmedFirstName)) {
        return 'Please double check your first name and then try again. It needs to be at least 3 characters and no more than 12 characters.';
    }

    // Build NickName
    const nick = `${trimmedFirstName} (${mc_name})`;

    // Update the name
    try {
        await rest.patch(Routes.guildMember(guild_id, member_id), {
            body: {
                nick: nick,
            },
        });
    } catch (err) {
        console.log(err);
        // Optionally return an error message if needed
    }

    return "";
}
