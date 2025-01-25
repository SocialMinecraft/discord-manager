import {Client, CommandInteraction} from "discord.js";
import {deployCommands} from "./deploy-commands";
import {commands} from "./commands";
import {config} from "./config";
import {connect, NatsConnection} from "nats";
import protobuf from "protobufjs";
import {setNickname} from "./helpers/set-nickename";
import path from "path";

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

    // connect to discord
    await deployCommands();
    await client.login(config.DISCORD_TOKEN);

    // todo - list for account name changes

    // Listen for name changes on nats
    const sub = nc.subscribe("accounts.minecraft.changed", {
        callback: async (err, msg) => {
            if (err) {
                console.log(err.message);
                return
            }

            let root = new protobuf.Root();
            root.resolvePath = (origin: string, target: string) => {
                const protoDir = "./proto";
                return path.resolve(protoDir, target);
            };
            root.loadSync("minecraft_account/minecraft_account_update.proto");
            let type = root.lookupType("MinecraftAccountChanged");

            let message = type.decode(msg.data, msg.data.byteLength);

            // @ts-ignore
            let account = message.account;
            console.log("accounts.minecraft.changed: ", message);
            console.log("accounts.minecraft.changed->account: ", account);
            if (account.isMain) {
                // @ts-ignore
                let err = await setNickname(
                    config.DISCORD_GUILD_ID,
                    message.deprecatedDiscordId,
                    null,
                    account.deprecatedFirstName,
                    account.minecraftUsername);
                if (err.length > 0) {
                    console.log("error setting nick: " + err);
                }
            }
        },
    });
}
start();
