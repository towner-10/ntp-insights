import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/server/db';
import { z } from 'zod';

export const pathRouter = createTRPCRouter({
	get: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ input }) => {
			const path = await prisma.path.findUnique({
				where: {
					id: input.id,
				},
			});

			if (!path) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Path not found' });
			}

			return path;
		}),
	getPublic: publicProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(async ({ input }) => {
			const path = await prisma.path.findUnique({
				where: {
					id: input.id,
				},
				include: {
					created_by: false,
					updated_by: false,
				},
			});

			if (!path) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Path not found' });
			}

			return path;
		}),
});
