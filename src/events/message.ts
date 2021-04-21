import { Message, MessageEmbed } from 'discord.js';
import { store } from '../store';

// Add custom commands to this
const commands = new Map([
    ['help', async (_message: Message, _args: string[]) => {
        return new MessageEmbed({
            author: {
                name: store.name
            }
        });
    }]
]);

export const onMessage = async function onMessage (message: Message) {
    // Don't process bot messages
    if (message.author.bot) return;

    // Get command and arguments
    const [command, ...args] = message.content.slice(1).trim().split(/ +/);

    // Bail if message is a DM
    if (!message.guild) return;

    // Get guild
    const guild = store.guilds.get(message.guild.id)!;

    // Bail if the message is missing the guild's prefix
    if (!message.content.startsWith(guild.prefix)) return;

    // Get the associate method for the command
    const commandFunction = commands.get(command);

    // Bail if we don't have that command
    if (!commandFunction) return;

    // Run the command
    await Promise.resolve(commandFunction(message, args));
};