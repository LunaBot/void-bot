import { logger } from '../logger';

export const onError = function onError(error) {
    logger.error(error);
};
