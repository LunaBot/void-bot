import { store } from '../store';
import { logger } from '../logger';
import { client } from '../client';
import { TextChannel } from 'discord.js';

export const onReady = async function onReady() {
    logger.info('BOT:READY');

    logger.info('BOT:CLEARING_OLD_MESSAGES');

    // Delete all old messages
    const deletedMessages = await Promise.all([...store.messagesToDelete.values()].map(async messageToDelete => {
        const guild = await client.guilds.fetch(messageToDelete.guildId);
        const channel = guild.channels.cache.get(messageToDelete.channelId) as TextChannel;
        const message = await channel.messages.fetch(messageToDelete.messageId);

        // Delete message
        await message.delete().catch(() => {});
    }));

    logger.info('BOT:CLEARED_OLD_MESSAGES [%s]', deletedMessages.length);
};
