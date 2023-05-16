import chalk from 'chalk';

const LOG_LEVEL = {
	DEBUG: 'DEBUG',
	SUCCESS: '✅ SUCCESS',
	WARN: '⚠️ WARN',
	ERROR: '❌ ERROR',
	FATAL: '⛔ FATAL',
} as const;

const LOG_LEVEL_COLORS = {
	DEBUG: chalk.blue,
	SUCCESS: chalk.green,
	WARN: chalk.yellow,
	ERROR: chalk.red,
	FATAL: chalk.magenta,
} as const;

type LogLevel = keyof typeof LOG_LEVEL;

export const logger = {
	log: (level: LogLevel, message: unknown) => {
		const timestamp = new Date().toISOString();

		console.log(
			`${timestamp} - ${LOG_LEVEL_COLORS[level](
				LOG_LEVEL[level]
			)}: ${message}`
		);
	},
	debug: (message: unknown) => logger.log('DEBUG', message),
	success: (message: unknown) => logger.log('SUCCESS', message),
	warn: (message: unknown) => logger.log('WARN', message),
	error: (message: unknown) => logger.log('ERROR', message),
};
