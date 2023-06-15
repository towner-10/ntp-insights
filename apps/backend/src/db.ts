import { PrismaClient, Search, SearchResult } from 'database';

const prisma = new PrismaClient();

export const getSearches = async () => {
	return await prisma.search.findMany();
};

export const verifyAccessToken = async (token: string) => {
	return await prisma.session.findFirst({
		where: {
			sessionToken: token,
		},
	});
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

export const setRunStats = async (
	search: Search,
	last_run_duration: number,
	next_run?: Date
) => {
	await prisma.search.update({
		where: {
			id: search.id,
		},
		data: {
			last_run: new Date(),
			last_run_duration: last_run_duration,
			next_run: next_run,
		},
	});
};

export const disableSearch = async (search: Search) => {
	await prisma.search.update({
		where: {
			id: search.id,
		},
		data: {
			enabled: false,
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

export const addTwitterSearchResult = async (
	search: Search,
	result: {
		response: any;
		location: any;
		duration: number;
	}
) => {
	return await prisma.searchResult.create({
		data: {
			search: {
				connect: {
					id: search.id,
				},
			},
			type: 'TWITTER',
			response: result.response,
			location: result.location,
			duration: result.duration,
		},
	});
};

export const addTwitterPost = async (
	searchResult: SearchResult,
	post: {
		id: string;
		author_id: string;
		comments: number;
		created_at: Date | string;
		likes: number;
		shares: number;
		content: string;
		images: string[];
		videos: string[];
		raw: any;
	}
) => {
	return await prisma.post.create({
		data: {
			search_result: {
				connect: {
					id: searchResult.id,
				},
			},
			source_type: 'TWITTER',
			source_id: post.id,
			author: post.author_id,
			url: `https://twitter.com/${post.author_id}/status/${post.id}`,
			created_at: post.created_at,
			comments: post.comments,
			likes: post.likes,
			shares: post.shares,
			content: post.content,
			images: post.images,
			videos: post.videos,
			raw: post.raw,
		},
	});
};
