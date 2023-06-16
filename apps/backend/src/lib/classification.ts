import cohere from 'cohere-ai';
import { Post } from 'database';
import { setCategory } from '../db';
import { logger } from '../utils/logger';

cohere.init(process.env.COHERE_API_KEY || '');

const cleanPost = (post: Post) => {
	let content = post.content;

	if (!content) return null;

	// Remove links
	content = content.replace(/https?:\/\/[^\s]+/g, '');

	// Remove newlines
	content = content.replace(/\n/g, ' ');

	// Replace multiple spaces with single space
	content = content.replace(/\s+/g, ' ');

	// Replace emojis with empty string
	content = content.replace(/[\u{1F600}-\u{1F6FF}]/gu, '');

	// Replace non-ascii characters with empty string
	content = content.replace(/[^\x00-\x7F]/g, '');

	// Strip leading and trailing whitespace
	content = content.trim();

	// Remove posts that are too short
	if (content.length < 10) return null;

	return content;
};

export const classifyPosts = async (posts: Post[]) => {
	const cleanedPosts = posts.map((post) => {
		const content = cleanPost(post);

		if (!content) return null;

		return {
			...post,
			content,
		};
	});

	// Remove null posts
	const filteredPosts = cleanedPosts.filter((post) => post !== null);

	// Classify Posts using co:here
	const response = await cohere.classify({
		model: '78f0a4f5-be6e-497e-ac61-101b6bb09615-ft',
		inputs: filteredPosts
			.map((post) => post?.content)
			.filter((content) => content !== null) as string[],
	} as any);

	if (response.statusCode !== 200) {
		logger.error(`Failed to classify posts: ${response.statusCode}`);
		throw new Error('Failed to classify posts');
	}

	const postsToUpdate: Promise<Post>[] = [];

	for (let i = 0; i < filteredPosts.length; i++) {
		if (filteredPosts[i] === null) continue;

		// Determine best classification
		const classifications = response.body.classifications[i].labels;

		const bestClassification = Object.keys(classifications).reduce(
			(best, classification) => {
				if (
					classifications[classification].confidence >
					classifications[best].confidence
				) {
					return classification;
				}

				return best;
			},
			Object.keys(classifications)[0]
		);

		// Add classification to post
		postsToUpdate.push(
			setCategory(filteredPosts[i]!.id, bestClassification)
		);
	}

	return Promise.all(postsToUpdate);
};
