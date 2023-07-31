export type FormState = {
	scan_id?: string;
}

export type DialogContentProps = {
	formState: FormState;
	onNext?: (formState: FormState) => void;
	onCancel?: () => void;
};