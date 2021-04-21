import { Channel, TextChannel } from "discord.js";

export const isTextBasedChannel = function isTextBasedChannel (channel?: Channel): channel is TextChannel {
    return channel?.type === 'text';
};
