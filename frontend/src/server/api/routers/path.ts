import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
	ntpProtectedProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/server/db';
import { z } from 'zod';

export const pathsRouter = createTRPCRouter({
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
	new: ntpProtectedProcedure
		.input(
			z.object({
				name: z.string(),
				date: z.date(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const path = await prisma.path.create({
				data: {
					name: input.name,
					date: input.date,
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

			return path;
		}),
});
