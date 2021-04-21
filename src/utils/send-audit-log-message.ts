import { client } from '../client';
import { MessageEmbed, TextChannel } from 'discord.js';
import { store } from '../store';
import { colours } from './colours';

interface SendAuditLogMessageOptions {
    // Guild for the audit log
    guildId: string;
    // Which ticket this concerns
    ticketNumber: number;
    // What colour you want the embed
    colour: keyof typeof colours;
};

export const sendAuditLogMessage = async (options: SendAuditLogMessageOptions) => {
    // Get ticket
    const ticket = store.tickets.get(`${options.guildId}_${options.ticketNumber}`);

    // Non existant ticket?
    if (!ticket) return;

    // Get guild
    const guild = client.guilds.cache.get(options.guildId)!;

    // Get member
    const member = guild.members.cache.get(ticket.member);

    // Non exitant member?
    if (!member) return;

    // Create embed
    const embed = new MessageEmbed({
        color: options.colour,
        author: {
            name: `Ticket number #${`${options.ticketNumber}`.padStart(5, '0')}`,
            iconURL: member?.user.displayAvatarURL({ format: 'png' })
        },
        fields: [{
            name: 'Username',
            value: member?.user.username,
            inline: true
        }, {
            name: 'Discriminator',
            value: member?.user.discriminator,
            inline: true
        }, {
            name: 'Default avatar',
            value: !member?.user.avatar ? 'Yes' : 'No',
            inline: true
        }, {
            name: 'ID',
            value: member.id,
            inline: true
        }, {
            name: 'Ticket number',
            value: options.ticketNumber,
            inline: true
        }, {
            name: 'Current state',
            value: ticket.state,
            inline: true
        }, {
            name: 'Step',
            value: ticket.step,
            inline: true
        }]
    });

    // Get audit-log channel
    const auditLogChannelId = store.guilds.get(guild.id as string, 'auditLogChannel');
    const auditLogChannel = guild?.channels.cache.find(channel => channel.id === auditLogChannelId) as TextChannel;

    // Post in audit-log
    await auditLogChannel.send(embed);
};
