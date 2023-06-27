import type { FrameposResult } from "@/utils/types/framepos";
export * from 'types';

export type FormStateData = {
	name: string;
	folder_name: string;
	date: Date;
	path_id?: string;
	framepos: FrameposResult[];
};

export type DialogContentProps = {
	formState: FormStateData;
	setFormState: (data: FormStateData) => void;
	onNext?: () => void;
	onCancel?: () => void;
};