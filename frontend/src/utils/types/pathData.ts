import { z } from "zod";

export type PathData = z.infer<typeof pathDataSchema>;

export const pathDataSchema = z.object({
	name: z.string(),
	dateRange: z.date(),
}).strict();
