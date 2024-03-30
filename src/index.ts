import {Client, CommandInteraction} from "discord.js";
import {deployCommands} from "./deploy-commands";
import {commands} from "./commands";
import {config} from "./config";
import {connect, NatsConnection} from "nats";
import protobuf, {Field} from "protobufjs";
import {setNickname} from "./helpers/set-nickename";

export let nc: NatsConnection;

const client = new Client({
    intents: [],
});

client.once("ready", () => {
    console.log("Discord bot is ready! 🤖");
});

client.on("interactionCreate", async (interaction: CommandInteraction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(interaction);
    }
});

const start = async () => {
    // Connect to nats
    try {
        nc = await connect({
            servers: config.NATS_URL,
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    // connect to disocrd
    await deployCommands();
    await client.login(config.DISCORD_TOKEN);

    // Listen for name changes on nats
    const sub = nc.subscribe("accounts.minecraft.changed", {
        callback: async (err, msg) => {
            if (err) {
                console.log(err.message);
                return
            }

            console.log(msg.data.toString());


            let root = protobuf.loadSync("../proto/accounts.proto");
            let type = root.lookupType("MinecraftAccountChanged")

            var message = type.decode(msg.data, msg.data.byteLength);

            if (message.account.isMain) {
                await setNickname(
                    config.DISCORD_GUILD_ID,
                    message.userId,
                    null,
                    message.account.firstName,
                    message.account.minecraftUsername);
            }
        },
    });
}
start();
