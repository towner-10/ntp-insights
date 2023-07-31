import {
	PrismaClient,
	ScanStatusCodes,
	ScanType,
	Search,
	SearchResult,
} from 'database';

const prisma = new PrismaClient();

export const getPathUploadData = async (id: string) => {
	try {
		const path = await prisma.path.findUnique({
			where: {
				id: id,
			},
		});

		if (!path) {
			return null;
		}

		return {
			editable: path.editable,
			folder_name: path.folder_name,
		};
	} catch (err) {
		return null;
	}
};

export const userExists = async (id: string) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: id,
			},
		});
	
		if (!user) {
			return false;
		}

		return true;
	} catch (err) {
		return false;
	}
};

export const getSearches = async () => {
	return await prisma.search.findMany();
};

export const getAllSearchResults = async () => {
	return await prisma.searchResult.findMany({
		include: {
			posts: true,
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
	next_run: Date | undefined | null
) => {
	await prisma.search.update({
		where: {
			id: search.id,
		},
		data: {
			last_run: new Date(),
			last_run_duration: last_run_duration,
			next_run: next_run,
			enabled: next_run ? true : false,
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
	return await prisma.post.upsert({
		where: {
			source_id: post.id,
		},
		create: {
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
		update: {
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

export const updateClassifications = async (
	id: string,
	classifications: {
		[label: string]: {
			confidence: number;
		};
	}
) => {
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

	return await prisma.post.update({
		where: {
			id: id,
		},
		data: {
			classifications: classifications,
			category: bestClassification,
		},
	});
};

export const newScan = async ({
	user_id,
	scan_location,
	scan_size,
	scan_type,
}: {
	user_id: string;
	scan_location: string;
	scan_size: number;
	scan_type: ScanType;
}) => {
	return await prisma.scan.create({
		data: {
			created_by_id: user_id,
			updated_by_id: user_id,
			scan_location: scan_location,
			scan_size: scan_size,
			scan_type: scan_type,
		},
	});
};

export const setScanStatus = async ({
	scan_id,
	status,
}: {
	scan_id: string;
	status: ScanStatusCodes;
}) => {
	return await prisma.scan.update({
		where: {
			id: scan_id,
		},
		data: {
			upload_status: status,
		},
	});
};

export const updateScanLocation = async ({
	scan_id,
	location,
}: {
	scan_id: string;
	location: string;
}) => {
	return await prisma.scan.update({
		where: {
			id: scan_id,
		},
		data: {
			scan_location: location,
		},
	});
};

export const isScanFolderNameUnique = async (folder_name: string) => {
	try {
		const result = await prisma.scan.findFirst({
			where: {
				scan_location: folder_name,
			}
		});

		if (!result) return true;
		return false;
	} catch (err) {
		return true;
	}
}
