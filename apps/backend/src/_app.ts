import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import Scheduler from './scheduler';
import NTPServer from './server';
import { Search } from 'database';
import {
	disableSearch,
	getEnabledSearches,
	getNewDisabledSearches,
	getNewSearches,
	setLastRun,
} from './db';
import { logger } from './utils/logger';

const UPDATE_FREQUENCY = 10000;

const scheduler = new Scheduler(UPDATE_FREQUENCY);
let searches: Search[] = [];

const eventMap: { [key: string]: () => Promise<void> } = {
	refresh: async () => {
		logger.debug('Refreshing searches');
		const newSearches = await getNewSearches(searches);
		const disabledSearches = await getNewDisabledSearches(searches);

		newSearches.forEach((search) => {
			addSearch(search, true);
			searches.push(search);
		});

		disabledSearches.forEach((search) => {
			scheduler.removeJob(search.id);
			searches = searches.filter((s) => s.id !== search.id);
		});

		logger.debug('Finished refreshing searches');
	},
	add: async () => {
		logger.debug('Adding search');
		const newSearches = await getNewSearches(searches);

		newSearches.forEach((search) => {
			addSearch(search, true);
			searches.push(search);
		});

		logger.debug('Finished adding search');
	},
	remove: async () => {
		logger.debug('Removing search');
		const disabledSearches = await getNewDisabledSearches(searches);

		disabledSearches.forEach((search) => {
			scheduler.removeJob(search.id);
			searches = searches.filter((s) => s.id !== search.id);
		});

		logger.debug('Finished removing search');
	},
};

const handleSearch = async (search: Search) => {
	const now = new Date().getTime();
	logger.debug(`Waiting for search ${search.id}`);

	// Disable Twitter search for now
	// if (search.twitter) {
	// 	logger.debug(`Searching Twitter for ${search.id}`);
	// 	await twitter.getTweetCount(search);
	// 	logger.debug(`Finished searching Twitter for ${search.id}`);
	// }

	const timeTaken = new Date().getTime() - now;
	await setLastRun(search, timeTaken);
	logger.debug(`Finished search ${search.id} in ${timeTaken}ms`);
};

const addSearch = (search: Search, immediate = false) => {
	scheduler.addJob(
		search.id,
		new Date(search.start_date),
		new Date(search.end_date),
		search.frequency,
		() => handleSearch(search),
		async () => {
			logger.debug(`Disabling search ${search.id}`);
			await disableSearch(search);
		},
		immediate
	);
};

(async () => {
	searches = await getEnabledSearches();

	searches.forEach((search) => {
		addSearch(search, true);
	});
})();

NTPServer.getInstance().setEventMap(eventMap);
NTPServer.getInstance()
	.getHttpServer()
	.listen(8000, () => {
		logger.success('Server listening on port 8000');
	});

process.on('SIGINT', () => {
	logger.debug('Cleaning up...');
	scheduler.stop();
	NTPServer.getInstance().getHttpServer().close();
	process.exit(0);
});
