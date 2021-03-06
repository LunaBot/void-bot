import humanInterval from 'human-interval';
import { client } from '../client';
import { Channel, Message, MessageEmbed, MessageReaction } from 'discord.js';
import { store } from '../store';
import { colours } from '../utils';
import prettyMs from 'pretty-ms';
import { logger } from 'logger';

// Add custom commands to this
const commands = new Map<string, any>([
    // !help
    ['help', {
        run: async (message: Message, _args: string[]) => {
            await message.channel.send(new MessageEmbed({
                author: {
                    name: client.user?.username
                },
                description: require('../../package.json').description,
                fields: [{
                    name: 'Commands',
                    value: [...commands.keys()].map(key => '`' + key + '`').join(', ')
                }]
            }));
        }
    }],
    // !debug
    ['debug', {
        run: async (message: Message, _args: string[]) => {
            // Only allow owner of the bot to run this
            if (message.author.id !== store.ownerID.toString()) return;

            // Get guild
            const guild = store.guilds.get(message.guild?.id!);

            // Return debug info about this guild
            await message.channel.send(new MessageEmbed({
                author: {
                    name: 'Debug'
                },
                description: '```json\n' + JSON.stringify(guild) + '\n```',
            }));
        }
    }],
    // !remind-me
    ['remind-me', {
        run: async (message: Message, _args: string[]) => {
            // Get member
            const member = store.members.get(message.author.id!);

            // Get guild
            const guild = store.guilds.get(message.guild?.id!);

            // Get reminder enabled state
            const enabled = member?.reminderEnabled ?? false;

            // Flip the member's reminder state
            store.members.set(message.author.id, !enabled, 'reminderEnabled');

            // Delete command message
            await message.delete();

            // Let the member know if the reminder was enable or disabled
            await message.author.send(new MessageEmbed({
                color: !enabled ? colours.GREEN : colours.RED,
                author: {
                    name: `Deletion reminder - ${!enabled ? 'enabled' : 'disabled'}!`
                },
                description: `Use \`${guild?.prefix ?? '!'}remind-me\` again to ${enabled ? 'enable' : 'disable'} this.`
            }));
        }
    }],
    // !commands
    ['commands', {
        run: async (message: Message, _args: string[]) => {
            await message.channel.send(new MessageEmbed({
                author: {
                    name: 'Commands'
                },
                fields: [...commands.entries()].filter(([,command]) => command.description).map(([commandName, command]) => {
                    return {
                        name: commandName,
                        value: command.description
                    }
                })
            }));
        }
    }],
    // !set-prefix $
    ['set-prefix', {
        description: 'Set the bot\'s prefix',
        run: async (message: Message, args: string[]) => {
            // Only the owner can set the prefix
            if (message.author.id !== message.guild?.ownerID) return;
            
            // No prefix given
            if (!args[0]) {
                await message.channel.send(new MessageEmbed({
                    color: colours.GREEN,
                    description: 'Please provide a prefix'
                }));
                return;
            }
    
            // Set prefix
            store.guilds.set(message.guild.id, args[0], 'prefix');
    
            // Let member know we changed the prefix
            await message.channel.send(new MessageEmbed({
                color: colours.GREEN,
                description: 'Prefix updated to `' + args[0] + '`'
            }));
        }
    }],
    // !enable-void
    ['enable-void', {
        description: 'Mark this channel as a void!',
        run: async (message: Message, _args: string[]) => {
            // Only the owner can enable the void
            if (message.author.id !== message.guild?.ownerID) return;

            // Enable void
            store.guilds.set(message.guild.id, true, `voids.${message.channel.id}.enabled`);
    
            // Let member know we marked this channel as a void
            await message.channel.send(new MessageEmbed({
                color: colours.GREEN,
                description: 'Void activated!'
            }));
            
        }
    }],
    // !disable-void
    ['disable-void', {
        description: 'Unmark this channel as a void.',
        run: async (message: Message, _args: string[]) => {
            // Only the owner can enable the void
            if (message.author.id !== message.guild?.ownerID) return;
    
            // Disable void
            store.guilds.set(message.guild.id, false, `voids.${message.channel.id}.enabled`);

            // Let member know we unmarked this channel as a void
            await message.channel.send(new MessageEmbed({
                color: colours.GREEN,
                description: 'Void deactivated!'
            }));
        }
    }],
    // !set-keep-phrase +keep+
    ['set-keep-phrase', {
        description: 'Set the phrase needed for your message to stay when this channel has a void enabled!',
        run: async (message: Message, args: string[]) => {
            // Only the owner can set the keep phrase
            if (message.author.id !== message.guild?.ownerID) return;

            // Get the phrase the user is trying to set
            const wantedPhrase = args.join(' ');
    
            // Set the keep phrase
            store.guilds.set(message.guild.id, wantedPhrase, `voids.${message.channel.id}.phrase`);

            // No phrase set
            if (!args[0]) {
                // Let member know we've disabled the keep phrase
                await message.channel.send(new MessageEmbed({
                    color: colours.GREEN,
                    description: 'Phrase disabled!'
                }));
                return;
            }
            
    
            // Let member know we've changed the keep phrase
            await message.channel.send(new MessageEmbed({
                color: colours.GREEN,
                description: 'Phrase set to `' + wantedPhrase + '`'
            }));
        }
    }],
    // !set-void-time 10s
    ['set-void-time', {
        description: 'Set the time until a message is voided!',
        run: async (message: Message, args: string[]) => {
            // Only the owner can set the keep phrase
            if (message.author.id !== message.guild?.ownerID) return;

            // No time given
            if (!args[0]) {
                await message.channel.send(new MessageEmbed({
                    color: colours.RED,
                    description: `Please provide a length of time`
                }));
                return;
            }

            // Get the time the user is trying to set
            const wantedTime = args.join(' ');

            // Get time as number
            const time = humanInterval(wantedTime);

            // Invalid time given
            if (!time) {
                await message.channel.send(new MessageEmbed({
                    color: colours.RED,
                    description: `Invalid time given "${wantedTime}"`
                }));
                return;
            }

            // Don't allow void times over 1 hour
            if (time > 3600000) {
                await message.channel.send(new MessageEmbed({
                    color: colours.RED,
                    description: 'Time cannot be set for more than 1 hour.'
                }));
                return;
            }
    
            // Set the void time
            store.guilds.set(message.guild.id, time, `voids.${message.channel.id}.time`);
    
            // Let member know we've changed the void time
            await message.channel.send(new MessageEmbed({
                color: colours.GREEN,
                description: 'Void time set to `' + prettyMs(time, { verbose: true }) + '`'
            }));
        }
    }]
]);

export const onMessage = async function onMessage (message: Message) {
    // Get command and arguments
    const [commandName, ...args] = message.content.slice(1).trim().split(/ +/);

    // Bail if message is a DM
    if (!message.guild) return;

    // Get guild
    const guild = store.guilds.get(message.guild.id)!;

    // If this looks like it might be a command then check it
    if (message.content.startsWith(guild.prefix)) {
        // Don't process bot commands
        if (message.author.bot) return;

        // Get the associate method for the command
        const command = commands.get(commandName);

        // Check if the command exists
        if (command && command.run) {
            // Run the command
            return Promise.resolve(command.run(message, args));
        }
    }

    // Get the void settings for this channel
    const thisChannel = guild.voids[message.channel.id];

    // Bail if this isn't a void channel
    if (!thisChannel) return;
    
    // Bail if this void channel is disabled
    if (!thisChannel.enabled) return;
    
    // Bail if we have a keep phrase set and this message contains it
    if (thisChannel.phrase && message.content.includes(thisChannel.phrase)) return;

    // Add message to store so it'll be deleted even if we restart
    const messageToDelete = {
        guildId: message.guild.id,
        channelId: message.channel.id,
        messageId: message.id,
        time: thisChannel.time
    };
    store.messagesToDelete.add(messageToDelete);

    // After x time delete the message
    setTimeout(async () => {
        try {
            // Get member 
            const member = store.members.get(message.author.id);

            // Message the member if they had reminders on
            if (member?.reminderEnabled) {
                // Message member
                await message.author.send(new MessageEmbed({
                    color: colours.AQUA,
                    author: {
                        name: 'Deletion reminder!'
                    },
                    description: `Message deleted in [${message.guild?.channels.cache.get(message.channel.id)?.name}](https://discord.com/channels/${message.guild?.id}/${message.channel.id}/${message.id})`
                })).catch(error => {
                    logger.error(`Failed messaging ${message.author.username ?? message.author.id} deletion reminder.`);
                });
            }

            // Delete the message
            await message.delete().catch(async error => {
                // Bail if the message was deleted before we got to it
                if (error.code === 10008) return;

                // Report the error
                await message.channel.send(new MessageEmbed({
                    color: colours.RED,
                    author: {
                        name: 'Error'
                    },
                    description: error.message,
                    fields: [{
                        name: 'Method',
                        value: error.method
                    }, {
                        name: 'Path',
                        value: error.path
                    }, {
                        name: 'Code',
                        value: error.code,
                        inline: true
                    }, {
                        name: 'Status code',
                        value: error.method,
                        inline: true
                    }]
                }));
            });

            // Remove the message from the store
            store.messagesToDelete.delete(messageToDelete);
        } catch (error) {
            console.log(error);
        }
    }, thisChannel.time);
};
