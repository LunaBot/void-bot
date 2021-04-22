import EnhancedMap from 'enmap';
import { defaultGuild, defaultMember } from './defaults';

const guilds = new EnhancedMap<string, typeof defaultGuild>({
    name: 'guilds',
    fetchAll: true,
    autoFetch: true,
    cloneLevel: 'deep',
    // @ts-expect-error
    autoEnsure: defaultGuild
});

const members = new EnhancedMap<string, typeof defaultMember>({
    name: 'members',
    fetchAll: true,
    autoFetch: true,
    cloneLevel: 'deep',
    // @ts-expect-error
    autoEnsure: defaultMember
});

export const store = {
    ownerID: 107834314439294976n,
    guilds,
    members,
    messagesToDelete: new Set<{
        guildId: string,
        channelId: string,
        messageId: string,
        time: number
    }>()
};
