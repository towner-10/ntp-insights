import {
	createTRPCRouter,
	protectedProcedure,
} from '@/server/api/trpc';
import { prisma } from '@/server/db';
import { z } from 'zod';

export const postRouter = createTRPCRouter({
	setFlagged: protectedProcedure
		.input(z.object({ id: z.string(), flagged: z.boolean() }))
		.mutation(async ({ input }) => {
			const post = await prisma.post.update({
				where: {
					id: input.id,
				},
				data: {
					flagged: input.flagged,
				},
			});

			return post;
		}),
});
