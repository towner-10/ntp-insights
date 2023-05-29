import { Post, PrismaClient, Search } from '@prisma/client';

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: process.env.DATABASE_URL_BACKEND,
		},
	},
});

export const getSearches = async () => {
	return await prisma.search.findMany();
};

export const getEnabledSearches = async () => {
	return await prisma.search.findMany({
		where: {
			enabled: true,
			archived: false,
		},
	});
};

export const getSearch = async (id: string) => {
	return await prisma.search.findUnique({
		where: {
			id: id,
		},
	});
};

export const getNewSearches = async (oldSearches: Search[]) => {
	return await prisma.search.findMany({
		where: {
			id: {
				notIn: oldSearches.map((search) => search.id),
			},
			enabled: true,
			archived: false,
		},
	});
};

export const setTweetCount = async (search: Search, count: number[]) => {
	await prisma.search.update({
		where: {
			id: search.id,
		},
		data: {
			tweet_count: count,
		},
	});
};

export const setLastRun = async (search: Search, last_run_time: number) => {
	await prisma.search.update({
		where: {
			id: search.id,
		},
		data: {
			last_run: new Date(),
			last_run_time: last_run_time,
		},
	});
};

export const getNewDisabledSearches = async (oldSearches: Search[]) => {
	const oldIDs = oldSearches.map((search) => search.id);

	return await prisma.search.findMany({
		where: {
			OR: [
				{
					id: {
						notIn: oldIDs,
					},
					enabled: false,
				},
				{
					id: {
						notIn: oldIDs,
					},
					archived: true,
				},
			],
		},
	});
};

export const newPost = async (post: Post) => {
	return await prisma.post.upsert({
		where: {
			source_id: post.source_id,
		},
		update: {
			source_type: post.source_type,
			source_id: post.source_id,
			url: post.url,
			content: post.content,
			created_at: post.created_at,
			author: post.author,
			location: post.location,
			images: post.images,
			videos: post.videos,
			likes: post.likes,
			comments: post.comments,
			shares: post.shares,
		},
		create: {
			source_type: post.source_type,
			source_id: post.source_id,
			url: post.url,
			content: post.content,
			created_at: post.created_at,
			author: post.author,
			location: post.location,
			images: post.images,
			videos: post.videos,
			likes: post.likes,
			comments: post.comments,
			shares: post.shares,
			search_id: post.search_id,
		},
	});
};
