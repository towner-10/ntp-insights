import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { prisma } from '@/server/db';
import { z } from 'zod';

export const postRouter = createTRPCRouter({
	setFlags: protectedProcedure
		.input(z.object({ ids: z.string().array(), flag: z.boolean() }))
		.mutation(async ({ input }) => {
			const posts = await prisma.post.updateMany({
				where: {
					id: {
						in: input.ids,
					},
				},
				data: {
					flagged: input.flag,
				},
			});
			return posts.count;
		}),
});
