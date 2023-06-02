import {
	createTRPCRouter,
	ntpProtectedProcedure,
} from '@/server/api/trpc';
import { prisma } from '@/server/db';
import { z } from 'zod';

export const image360Router = createTRPCRouter({
	newNTP: ntpProtectedProcedure
		.input(
			z.object({
				path_id: z.string(),
                index: z.number(),
                url: z.string(),
                image_size: z.number(),
                date_taken: z.date().optional(),
                lng: z.number(),
                lat: z.number(),
                altitude: z.number().optional(),
                distance: z.number().optional(),
                heading: z.number().optional(),
                pitch: z.number().optional(),
                roll: z.number().optional(),
                track: z.number().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const image = await prisma.image360.create({
				data: {
                    path_id: input.path_id,
                    index: input.index,
                    image_url: input.url,
                    image_size: input.image_size,
                    date_taken: input.date_taken,
                    lng: input.lng,
                    lat: input.lat,
                    altitude: input.altitude,
                    distance: input.distance,
                    heading: input.heading,
                    pitch: input.pitch,
                    roll: input.roll,
                    track: input.track,
				},
			});

			return image;
		}),
});
