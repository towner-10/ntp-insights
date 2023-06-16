import { searchDataSchema } from '@/utils/types/searchData';
import {
	createTRPCRouter,
	ntpProtectedProcedure,
	protectedProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/server/db';
import { z } from 'zod';

export const searchResultsRouter = createTRPCRouter({
	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const result = await prisma.searchResult.findUnique({
				where: {
					id: input.id,
				},
			});

			if (!result) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Search Result not found.',
				});
			}

			return result;
		}),
	getAllForSearch: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const results = await prisma.searchResult.findMany({
				where: {
					search: {
						id: input.id,
					},
				},
				include: {
					posts: true,
				},
				orderBy: {
					created_at: 'desc',
				},
			});

			return results;
		}),
});
