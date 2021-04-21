import { logger } from './logger';
import { config } from './config';
import { start } from './app';

// Main app
(async () => {
    logger.info('BOT:VALIDATING_CONFIG');
    if (!config.botToken) {
        logger.error('INVALID_BOT_TOKEN');
        process.exit(1);
    }

    logger.info('BOT:STARTING');

    await start().catch(error => {
        logger.error(error);
    });
})();
