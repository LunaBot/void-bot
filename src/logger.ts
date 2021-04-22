import chalk from 'chalk';

export const logger = {
    info(message: string, ...optionalParams: any[]) {
        console.info.bind(console)(`[${chalk.cyan('INFO')}]${message}`, ...optionalParams);
    },
    debug(message: string, ...optionalParams: any[]) {
        console.debug.bind(console)(`[${chalk.magenta('DEBUG')}]${message}`, ...optionalParams);
    },
    error(error: Error | string, ...optionalParams: any[]) {
        console.error.bind(console)(`[${chalk.red('ERROR')}]`, error, ...optionalParams);
    }
};