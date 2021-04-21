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
    name: require('../../package.json').name,
    guilds,
    members
};