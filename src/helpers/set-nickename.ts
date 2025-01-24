import {REST, Routes} from "discord.js";
import {config} from "../config";
import * as validators from "./validators";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

// Will only set the nickname if a valid one is not present. (unless force=true)
export async function setNickname(
    guild_id: string, member_id: string, current_nick: string|null,
    first_name: string, mc_name: string ) {

    // do they have a valid discord name already and this is not a force update?
    if (current_nick != null && validators.isValidDiscordName(current_nick)) {
        return "";
    }

    // check first name
    if (!validators.isValidFirstName(first_name)) {
        return 'Please double check your first name and then try again. It needs to be at least 3 characters and no more than 12 characters.';
    }

    // Build NickName
    const nick = first_name + ' (' + mc_name + ')';

    // Update the name
    try {
        await rest.patch(Routes.guildMember(guild_id, member_id), {
            body: {
                nick: nick,
            }
        })
    } catch (err) {
        console.log(err);
        //return "An Error occured while attempting to update your discord name."
    }

    return "";
}
