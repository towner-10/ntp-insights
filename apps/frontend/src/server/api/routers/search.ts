import { searchDataSchema } from '@/utils/types/searchData';
import {
	createTRPCRouter,
	ntpProtectedProcedure,
	protectedProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/server/db';
import { z } from 'zod';
import { findLocation, stateCodes } from '@/utils/geocoding';

export const searchRouter = createTRPCRouter({
	new: ntpProtectedProcedure
		.input(searchDataSchema)
		.mutation(async ({ ctx, input }) => {
			const location = await findLocation({
				lng: input.map.lng,
				lat: input.map.lat,
			});

			const response = await prisma.search.create({
				data: {
					name: input.name,
					longitude: input.map.lng,
					latitude: input.map.lat,
					location_keywords: input.map.keywords,
					province:
						location?.stateCode ||
						stateCodes[location?.state || 'None'] ||
						null,
					keywords: input.keywords,
					negative_keywords: input.negativeKeywords,
					start_date: input.dateRange.from || new Date(),
					end_date: input.dateRange.to || input.dateRange.from || new Date(),
					frequency: input.frequency,
					max_results: input.maxResults,
					facebook: input.facebook,
					twitter: input.twitter,
					created_by: {
						connect: {
							id: ctx.session.user.id,
						},
					},
					updated_by: {
						connect: {
							id: ctx.session.user.id,
						},
					},
				},
			});

			if (response.enabled) {
				return {
					id: response.id,
					message: `Search created and enabled at ${
						location?.formattedAddress || 'unknown'
					}.`,
				};
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to create search',
			});
		}),
	enable: ntpProtectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const response = await prisma.search.update({
				where: {
					id: input.id,
				},
				data: {
					enabled: true,
					updated_by: {
						connect: {
							id: ctx.session.user.id,
							email: ctx.session.user.email || undefined,
						},
					},
				},
			});

			if (response.enabled) {
				return {
					id: response.id,
					message: 'Search enabled',
				};
			}
		}),
	disable: ntpProtectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const response = await prisma.search.update({
				where: {
					id: input.id,
				},
				data: {
					enabled: false,
					updated_by: {
						connect: {
							id: ctx.session.user.id,
							email: ctx.session.user.email || undefined,
						},
					},
				},
			});

			if (!response.enabled) {
				return {
					id: response.id,
					message: 'Search disabled',
				};
			}
		}),
	update: ntpProtectedProcedure
		.input(
			z.object({
				id: z.string(),
				search: searchDataSchema,
			})
		)
		.mutation(async ({ ctx, input }) => {
			const location = await findLocation({
				lng: input.search.map.lng,
				lat: input.search.map.lat,
			});

			const response = await prisma.search.update({
				where: {
					id: input.id,
				},
				data: {
					name: input.search.name,
					longitude: input.search.map.lng,
					latitude: input.search.map.lat,
					location_keywords: input.search.map.keywords,
					negative_keywords: input.search.negativeKeywords,
					province:
						location?.stateCode ||
						stateCodes[location?.state || 'None'] ||
						null,
					keywords: input.search.keywords,
					start_date: input.search.dateRange.from || new Date(),
					end_date:
						input.search.dateRange.to ||
						input.search.dateRange.from ||
						new Date(),
					frequency: input.search.frequency,
					max_results: input.search.maxResults,
					facebook: input.search.facebook,
					twitter: input.search.twitter,
					updated_by: {
						connect: {
							id: ctx.session.user.id,
							email: ctx.session.user.email || undefined,
						},
					},
				},
			});

			if (response) {
				return {
					id: response.id,
					message: 'Search updated',
				};
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to update search',
			});
		}),
	archive: ntpProtectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const response = await prisma.search.update({
				where: {
					id: input.id,
				},
				data: {
					archived: true,
					updated_by: {
						connect: {
							id: ctx.session.user.id,
							email: ctx.session.user.email || undefined,
						},
					},
				},
			});

			if (response.archived) {
				return {
					id: response.id,
					message: 'Search archived',
				};
			}
		}),
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const response = await prisma.search.findUnique({
				where: {
					id: input.id,
				},
				include: {
					_count: {
						select: {
							results: true,
						},
					},
					results: true,
				},
			});

			return response;
		}),
	getAll: protectedProcedure
		.input(z.object({ archived: z.boolean().optional() }))
		.query(async ({ input }) => {
			return await prisma.search.findMany({
				where: {
					archived: input.archived || false,
				},
			});
		}),
	getUpdatedBy: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const response = await prisma.search.findMany({
				where: {
					updated_by: {
						id: input.id,
					},
				},
				include: {
					created_by: true,
				},
			});

			return response;
		}),
	geocodeKeywords: protectedProcedure
		.input(z.object({ lng: z.number(), lat: z.number() }))
		.query(async ({ input }) => {
			const location = await findLocation({
				lng: input.lng,
				lat: input.lat,
			});

			if (location) {
				const response: string[] = [];

				if (location.city) response.push(location.city);
				if (location.state) response.push(location.state);
				if (location.stateCode) {
					response.push(`#${location.stateCode}Storm`);
					response.push(`#${location.stateCode}WX`);
				} else if (stateCodes[location?.state || 'None']) {
					response.push(`#${stateCodes[location.state]}Storm`);
					response.push(`#${stateCodes[location.state]}WX`);
				}

				return response;
			}

			return [];
		}),
	download: ntpProtectedProcedure
		.input(
			z.object({
				id: z.string(),
				format: z.enum(['csv', 'json']),
				start_date: z.date(),
				end_date: z.date(),
			})
		)
		.mutation(async ({ input }) => {
			// UTF-8 content cleaner
			const clean = (str: string) => {
				return str
					.replace('\n', ' ')
					.replace(/ +/g, ' ')
					.replace(/https?:\/\/.*[\r\n]*/g, '')
					.replace(/[^\x00-\x7F]+/g, '')
					.replace(/["]+/g, '')
					.replace(/[^\x00-\x7F]+/g, '')
					.replace(/\?{2,}/g, '?')
					.trim();
			};

			try {
				const response = await prisma.search.findUnique({
					where: {
						id: input.id,
					},
					include: {
						results: {
							where: {
								created_at: {
									gte: input.start_date,
									lte: input.end_date,
								},
							},
							include: {
								posts: {
									where: {
										created_at: {
											gte: input.start_date,
											lte: input.end_date,
										},
									},
								},
							},
						},
					},
				});

				if (!response) return null;

				if (input.format === 'json') {
					// Return list of posts
					return response.results
						.filter((result) => result.posts.length > 0)
						.map((result) => {
							return result.posts.map((post) => {
								return {
									...post,
									content: clean(post.content),
								};
							});
						});
				} else if (input.format === 'csv') {
					// Create CSV header
					const header =
						'id,score,category,relevant,irrelevant,source_type,source_id,url,content,found_at,updated_at,created_at,author,images,videos,likes,shares,comments,flagged,search_result_id\n';

					// Create CSV body
					const body = response.results
						.filter((result) => result.posts.length > 0)
						.map((result) => {
							return result.posts
								.map((post) => {
									return `${post.id},${post.score || 'N/A'},${post.category},${
										post.classifications['RELEVANT']['confidence']
									},${post.classifications['IRRELEVANT']['confidence']},${
										post.source_type
									},${post.source_id},${post.url},"${clean(post.content)}",${
										post.found_at
									},${post.updated_at},${post.created_at},${
										post.author
									},"${post.images.join(',')}","${post.videos.join(',')}",${
										post.likes
									},${post.shares},${post.comments},${
										post.flagged
									},${post.search_result_id.trimEnd()}`;
								})
								.join('\n');
						})
						.join('\n');

					// Return CSV
					return header + body;
				}
			} catch (error) {
				console.log(error);
			}

			return null;
		}),
});
