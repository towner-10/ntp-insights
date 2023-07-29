import { TwitterApi } from 'twitter-api-v2';
import { logger } from '../../utils/logger';
import { Search } from 'database';

const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
const readOnlyClient = client.readOnly;

const buildKeywordQuery = (search: Search) => {
	const keywords = search.keywords
		.map((keyword) => {
			if (keyword.includes(' ')) return `(${keyword})`;
			return keyword;
		})
		.join(' OR ');

	const locationKeywords = search.location_keywords
		.map((keyword) => {
			if (keyword.includes(' ')) return `(${keyword})`;
			return keyword;
		})
		.join(' OR ');

	const negativeKeywords = search.negative_keywords
		.map((keyword) => {
			if (keyword.includes(' ')) return `-(${keyword})`;
			return `-${keyword}`;
		})
		.join(' ');

	return `(${keywords}) (${locationKeywords}) (${negativeKeywords}) has:media`;
};

export const twitter = {
	getTweets: async (search: Search) => {
		logger.debug(buildKeywordQuery(search));

		return await readOnlyClient.v2.search(buildKeywordQuery(search), {
			max_results: search.max_results,
			expansions: ['attachments.media_keys', 'geo.place_id', 'author_id'],
			'media.fields': [
				'duration_ms',
				'height',
				'media_key',
				'preview_image_url',
				'type',
				'url',
				'width',
				'public_metrics',
				'alt_text',
				'variants',
			],
			'place.fields': ['country', 'country_code', 'full_name', 'geo'],
			'user.fields': ['id', 'name', 'username'],
			'tweet.fields': [
				'attachments',
				'author_id',
				'created_at',
				'id',
				'lang',
				'public_metrics',
				'text',
				'source',
			],
		});
	},
};
