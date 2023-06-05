import type { FrameposResult } from "@/utils/types/framepos";
import { type Image360 } from "@prisma/client";
export * from 'types';

export type FormStateData = {
	name: string;
	date: Date;
	path_id?: string;
	framepos: FrameposResult[];
	surveys: Image360[];
	comparison: File[];
};

export type DialogContentProps = {
	formState: FormStateData;
	setFormState: (data: FormStateData) => void;
	onNext?: () => void;
	onCancel?: () => void;
};