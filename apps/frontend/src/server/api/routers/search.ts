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
					location: {
						lng: input.map.lng,
						lat: input.map.lat,
						radius: input.radius,
					},
					location_keywords: location
						? ([location.city, location.state, location.country] as string[])
						: [],
					province:
						location?.stateCode ||
						stateCodes[location?.state || 'None'] ||
						null,
					keywords: input.keywords,
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
					location: {
						lng: input.search.map.lng,
						lat: input.search.map.lat,
						radius: input.search.radius,
					},
					location_keywords: location
						? ([location.city, location.state, location.country] as string[])
						: [],
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
							posts: true,
						},
					},
				},
			});

			return response;
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
});