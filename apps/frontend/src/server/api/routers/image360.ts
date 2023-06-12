import { createTRPCRouter, ntpProtectedProcedure } from '@/server/api/trpc';
import { prisma } from '@/server/db';
import { image360DataSchema } from '@/utils/types/image360Data';
import { z } from 'zod';

export const image360Router = createTRPCRouter({
	newNTP: ntpProtectedProcedure
		.input(image360DataSchema.array())
		.mutation(async ({ input }) => {
			const image = await prisma.image360.createMany({
				data: input.map((image) => ({
					path_id: image.path_id,
					index: image.index,
					image_url: image.url,
					image_size: image.image_size,
					date_taken: image.date_taken,
					lng: image.lng,
					lat: image.lat,
					altitude: image.altitude,
					distance: image.distance,
					heading: image.heading,
					pitch: image.pitch,
					roll: image.roll,
					track: image.track,
				})),
			});

			return image;
		}),
	newGoogleImage: ntpProtectedProcedure
		.input(
			image360DataSchema.omit({
				index: true,
			})
		)
		.mutation(async ({ input }) => {
			const image = await prisma.image360.create({
				data: {
					path_id: input.path_id,
					source: 'GOOGLE',
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
	setBeforeImage: ntpProtectedProcedure
		.input(
			z.object({
				before_image_id: z.string(),
				image_indexes: z.array(z.number()),
			})
		)
		.mutation(async ({ input }) => {
			return await prisma.image360.updateMany({
				where: {
					index: {
						in: input.image_indexes,
					},
				},
				data: {
					before_id: input.before_image_id,
				},
			});
		}),
});
