import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

const WIKI_LINK = 'https://doc.clickup.com/9013455369/d/h/8ckwug9-53/856b548acfcac7e';
const SECTIONS: Record<string, string> = {
    'vip': 'https://doc.clickup.com/9013455369/d/h/8ckwug9-53/856b548acfcac7e/8ckwug9-673',
    'game-modes': 'https://doc.clickup.com/9013455369/d/h/8ckwug9-53/856b548acfcac7e/8ckwug9-533',
    'general-how-tos': 'https://doc.clickup.com/9013455369/d/h/8ckwug9-53/856b548acfcac7e/8ckwug9-373',
    'season-3-government': 'https://doc.clickup.com/9013455369/d/h/8ckwug9-53/856b548acfcac7e/8ckwug9-73'
};

export const data = new SlashCommandBuilder()
    .setName('wiki')
    .setDescription('Get the link to the official wiki.')
    .addStringOption(option => 
        option.setName('section')
            .setDescription('Specify a section of the wiki to visit')
            .setRequired(false)
            .addChoices(
                { name: 'VIP', value: 'vip' },
                { name: 'Game Modes', value: 'game-modes' },
                { name: 'General How-Tos', value: 'general-how-tos' },
                { name: 'Season 3 Government', value: 'season-3-government' }
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const section = interaction.options.getString('section');
    if (!section) {
        await interaction.reply({
            content: `📖 Here is the main wiki link: <${WIKI_LINK}>`,
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    
    const link = SECTIONS[section] || WIKI_LINK;
    await interaction.reply({
        content: `📖 Here is the ${section.replace(/-/g, ' ')} wiki link: <${link}>`,
        flags: MessageFlags.Ephemeral
    });
}
