import { prisma } from '@/server/db';
import { createTRPCRouter, ntpProtectedProcedure, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const usersRouter = createTRPCRouter({
	getAllUnauthenticated: ntpProtectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).nullish(),
				cursor: z.string().nullish(),
			})
		)
		.query(async ({ ctx, input }) => {
			const limit = input.limit ?? 10;
			const { cursor } = input;

			const users = await prisma.user.findMany({
				take: limit + 1,
				where: {
					ntpAuthenticated: false,
					id: {
						not: ctx.session.user.id,
					},
				},
				cursor: cursor
					? {
							id: cursor,
					  }
					: undefined,
				orderBy: {
					id: 'asc',
				},
			});

			let nextCursor: typeof cursor | undefined = undefined;
			if (users.length > limit) {
				const nextUser = users.pop();
				nextCursor = nextUser?.id;
			}

			return {
				users,
				nextCursor,
			};
		}),
	authenticate: ntpProtectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const user = await prisma.user.update({
				where: {
					id: input.id,
				},
				data: {
					ntpAuthenticated: true,
				},
			});

			return user;
		}),
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				image: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const user = await prisma.user.update({
				where: {
					id: input.id,
				},
				data: {
					name: input.name,
					image: input.image,
				},
			});

			return user;
		}),
});
