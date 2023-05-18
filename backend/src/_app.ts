import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import Scheduler from './scheduler';
import NTPServer from './server';
import { Search } from '@prisma/client';
import {
	getEnabledSearches,
	getNewDisabledSearches,
	getNewSearches,
} from './database';
import { logger } from './utils/logger';
import { randomInt } from 'crypto';
import { facebook } from './lib/facebook';

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

const addSearch = (search: Search, immediate = false) => {
	scheduler.addJob(
		search.id,
		new Date(search.start_date),
		new Date(search.end_date),
		search.frequency,
		async () => {
			logger.debug(`Waiting for search ${search.id}`);
			await new Promise((resolve) => {
				setTimeout(() => {
					logger.debug(`Finished search ${search.id}`);
					resolve(0);
				}, randomInt(10000, 50000));
			});
		},
		immediate
	);
};

(async () => {
	searches = await getEnabledSearches();

	// searches.forEach((search) => {
	// 	addSearch(search, false);
	// });

	await facebook.fetchGroupPosts('ontariostormreports', 20);
})();

NTPServer.getInstance().setEventMap(eventMap);
NTPServer.getInstance()
	.getServer()
	.listen(8000, () => {
		logger.success('Server listening on port 8000');
	});

process.on('SIGINT', () => {
	logger.debug('Cleaning up...');
	scheduler.stop();
	NTPServer.getInstance().getServer().close();
	process.exit(0);
});
