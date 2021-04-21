import dotEnv from 'dotenv';

// Load envs
dotEnv.config();

export const config = {
    botToken: process.env.BOT_TOKEN,
};
