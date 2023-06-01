import { Search } from '@prisma/client';
import { TwitterApi } from 'twitter-api-v2';
import { setTweetCount } from '../database';

const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '');
const readOnlyClient = client.readOnly;

const buildKeywordQuery = (search: Search) => {
	// User specified keywords are OR'd together
	const keywords = search.keywords
		.map((keyword) => {
			if (keyword.includes(' ')) return `(${keyword})`;

			return keyword;
		})
		.join(' OR ');

	// Auto-generated keywords are OR'd together
	const locationKeywords = search.location_keywords
		.map((keyword) => {
			if (keyword.includes(' ')) return `(${keyword})`;
			return keyword;
		})
		.join(' OR ');

	return `(storm OR tornado OR twister OR (funnel cloud) OR (tornado warning) OR wind OR damage) (London OR Ontario OR #ONStorm) (@weathernetwork OR @NTP_Reports) (lang:en OR lang:fr) -? -winter -snow since:2023-01-01`;
};

export const twitter = {
	getTweetCount: async (search: Search) => {
		const response = await readOnlyClient.v2.tweetCountRecent(buildKeywordQuery(search), {
			granularity: 'day',
		});

		const tweetCounts =
			response.data?.map((data) => data.tweet_count) || [];

		await setTweetCount(search, tweetCounts);
	},
	getTweets: async (search: Search) => {
		
	}
};
