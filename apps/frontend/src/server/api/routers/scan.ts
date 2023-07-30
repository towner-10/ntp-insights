import { ntpProtectedProcedure, createTRPCRouter } from '../trpc';
import { prisma } from '@/server/db';
import { z } from 'zod';

export const scansRouter = createTRPCRouter({
	getAllPublic: ntpProtectedProcedure.query(async () => {
		const scans = await prisma.scan.findMany({
			where: {
				archived: false,
			},
			include: {
				created_by: false,
				updated_by: false,
			},
		});
		return scans;
	}),
	rename: ntpProtectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const scan = await prisma.scan.update({
				where: {
					id: input.id,
				},
				data: {
					name: input.name,
					updated_by: {
						connect: {
							id: ctx.session.user.id,
						},
					},
				},
			});

			return scan;
		}),
	archive: ntpProtectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const scan = await prisma.scan.update({
				where: {
					id: input.id,
				},
				data: {
					archived: true,
					updated_by: {
						connect: {
							id: ctx.session.user.id,
						},
					},
				},
			});

			return scan;
		}),
});
