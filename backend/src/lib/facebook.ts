import puppeteer, { Browser } from 'puppeteer';
import { logger } from '../utils/logger';
import selectors from '../utils/selectors';

export const facebook = {
	fetchGroupPosts: async (groupId: string, max: number) => {
		// let browser: Browser | undefined;

		// try {
		// 	browser = await puppeteer.launch({ headless: 'new' });
		// 	const page = await browser.newPage();

		// 	await page.setViewport({ width: 1280, height: 800 });
		// 	await page.goto(`https://www.facebook.com/groups/${groupId}?v=timeline`);

		// 	const cssGroup = '#m_group_stories_container > div > div';

		// 	// Wait for page to load
		// 	await page.waitForSelector(cssGroup);

		// 	// Wait 2 seconds for posts to load
		// 	await new Promise((resolve) => setTimeout(resolve, 2000));

		// 	const feed = await page.$$(cssGroup);

		// 	if (!feed) {
		// 		throw new Error('Could not find feed');
		// 	}

		// 	logger.debug(`Found ${feed?.length} posts`);
		// } catch (error) {
		// 	logger.error(error);
		// } finally {
		// 	await browser?.close();
		// }

		// If error status code, throw error
		// const status = await page.evaluate(() => {
		//     return document.querySelector('body')?.getAttribute('data-status');
		// });

		// const feed = await page.$(
		// 	selectors.facebook_group.group_feed_container
		// );

		// if (!feed) {
		// 	throw new Error('Could not find feed');
		// }

		// logger.debug('Found feed');

		// const posts = await feed.$$('div:nth-child(4) > div > div > div > div > div > div > div > div > div');

		// logger.debug(`Found ${posts.length} posts`);

		// const postTexts = [];

		// await page.close();
		// await browser.close();
	},
};
