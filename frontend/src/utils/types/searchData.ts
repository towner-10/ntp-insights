import { z } from "zod";

export type SearchData = z.infer<typeof searchDataSchema>;

export const searchDataSchema = z.object({
	name: z.string(),
	dateRange: z.object({
		from: z.date().optional(),
		to: z.date().optional(),
	}),
	map: z.object({
		lng: z.number(),
		lat: z.number(),
	}),
	radius: z.number(),
	keywords: z.array(z.string()),
	frequency: z.number(),
	maxResults: z.number(),
	facebook: z.boolean(),
	instantWeather: z.boolean(),
}).strict();
