import { z } from "zod";

export const image360DataSchema = z.object({
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

export type Image360Data = z.infer<typeof image360DataSchema>;