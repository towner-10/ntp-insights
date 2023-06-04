import { createTRPCRouter, ntpProtectedProcedure } from '@/server/api/trpc';
import { prisma } from '@/server/db';
import { z } from 'zod';

const image360Schema = z.object({
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
});

export const image360Router = createTRPCRouter({
	newNTP: ntpProtectedProcedure
		.input(image360Schema)
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
	newGoogleImage: ntpProtectedProcedure
		.input(
			image360Schema.omit({
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
				image_ids: z.array(z.string()),
			})
		)
		.mutation(async ({ input }) => {
			const result = await prisma.image360.updateMany({
				where: {
					id: {
						in: input.image_ids,
					},
				},
				data: {
					before_id: input.before_image_id,
				},
			});

			if (result.count !== input.image_ids.length) {
				throw new Error('Failed to set before image');
			}

			return result;
		}),
});
