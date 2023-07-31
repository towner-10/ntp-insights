import {
	ntpProtectedProcedure,
	createTRPCRouter,
	publicProcedure,
} from '../trpc';
import { prisma } from '@/server/db';
import { z } from 'zod';

export const scansRouter = createTRPCRouter({
	getPublic: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			if (input.id === '') {
				return null;
			}

			const scan = await prisma.scan.findFirst({
				where: {
					id: input.id,
					archived: false,
				},
				include: {
					created_by: false,
					updated_by: false,
				},
			});

			return scan;
		}),
	getAll: ntpProtectedProcedure.query(async () => {
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
	duplicateFolderName: publicProcedure
		.input(
			z.object({
				folder_name: z
					.string()
					.regex(/^[a-zA-Z][a-zA-Z0-9-_]+$/)
					.optional(),
			})
		)
		.mutation(async ({ input }) => {
			try {
				const scan = await prisma.scan.findFirst({
					where: {
						scan_location: input.folder_name,
					},
				});

				if (scan) {
					return true;
				}

				return false;
			} catch {
				return false;
			}
		}),
	setScanData: ntpProtectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: z.object({
					name: z.string(),
					date_taken: z.date(),
					scan_type: z.enum(['GROUND', 'AERIAL']),
				}),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const scan = await prisma.scan.update({
				where: {
					id: input.id,
				},
				data: {
					name: input.data.name,
					date_taken: input.data.date_taken,
					scan_type: input.data.scan_type,
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
