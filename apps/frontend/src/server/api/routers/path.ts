import {
	createTRPCRouter,
	publicProcedure,
	protectedProcedure,
	ntpProtectedProcedure,
} from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/server/db';
import { z } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Path } from 'database';

type NewPathResponse = {
	code: 'SUCCESS' | 'DUPLICATE_FOLDER_NAME' | 'UNKNOWN';
	message: string;
	data?: Path;
};

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
					images: {
						include: {
							before: true,
						},
					},
					created_by: false,
					updated_by: false,
				},
			});

			if (!path) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Path not found' });
			}

			return path;
		}),
	// TODO: Add pagination
	getAllPublic: publicProcedure.query(async () => {
		const paths = await prisma.path.findMany({
			where: {
				archived: false,
			},
		});
		return paths;
	}),
	duplicateFolderName: publicProcedure
		.input(
			z.object({
				folder_name: z.string().min(3).max(50).regex(/^[a-zA-Z][a-zA-Z0-9-_]+$/),
			})
		)
		.mutation(async ({ input }) => {
			try {
				const path = await prisma.path.findUnique({
					where: {
						folder_name: input.folder_name,
					},
				});

				if (path) {
					return true;
				}

				return false;
			} catch {
				return false;
			}
		}),
	new: ntpProtectedProcedure
		.input(
			z.object({
				name: z.string(),
				folder_name: z.string().min(3).max(50).regex(/^[a-zA-Z][a-zA-Z0-9-_]+$/),
				date: z.date(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			try {
				const path = await prisma.path.create({
					data: {
						name: input.name,
						folder_name: input.folder_name,
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

				return {
					code: 'SUCCESS',
					message: 'Path created successfully',
					data: path,
				} as NewPathResponse;
			} catch (err) {
				if (err instanceof PrismaClientKnownRequestError) {
					if (err.code === 'P2002') {
						return {
							code: 'DUPLICATE_FOLDER_NAME',
							message: 'Path with this folder name already exists',
						} as NewPathResponse;
					}
				}

				return {
					code: 'UNKNOWN',
					message: 'Unknown error',
				} as NewPathResponse;
			}
		}),
	rename: ntpProtectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const path = await prisma.path.update({
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

			return path;
		}),
	archive: ntpProtectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const path = await prisma.path.update({
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

			return path;
		}),
});
