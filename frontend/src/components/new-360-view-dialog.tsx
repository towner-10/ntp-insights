import { Button } from './ui/button';
import { Label } from './ui/label';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogTrigger,
} from './ui/alert-dialog';
import { type FormEvent, useEffect, useState } from 'react';
import { DragAndDropZone } from './input/drag-and-drop-zone';
import { Input } from './ui/input';
import { useWebSocketContext } from './socket-context';
import { useToast } from './ui/use-toast';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

type DialogContentProps = {
	formState: FormStateData;
	onNext?: (data?: unknown) => void;
	onCancel?: () => void;
};

type FramePosCallbackData = {
	frame_index: number;
	lat: number;
	lon: number;
	pano_id: string;
};

type FormStateData = {
	name?: string;
	framepos: FramePosCallbackData[];
	survey: File[];
	comparison: File[];
};

function DialogContentHeader(props: {
	index: number;
	title: React.ReactNode;
	description: React.ReactNode;
}) {
	return (
		<div className="flex w-full flex-col md:w-96 lg:w-[500px]">
			<Label htmlFor="event-name" className="pb-2">
				<div className="flex flex-row gap-5">
					<span>{props.index}</span>
					<span>{props.title}</span>
				</div>
			</Label>
			<p className="pt-1 text-xs text-muted-foreground">{props.description}</p>
		</div>
	);
}

function NameDialogContent(props: DialogContentProps) {
	type Inputs = {
		name: string;
	};

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>();

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void (async () => {
			await handleSubmit((data) => {
				props.onNext?.(data.name);
			})(event);
		})();
	};

	return (
		<form onSubmit={onSubmit}>
			<AlertDialogFooter className="flex-col items-center sm:space-y-2 md:flex-row md:justify-between">
				<div className="flex w-full flex-col md:w-96 lg:w-[500px]">
					<Label htmlFor="event-name" className="pb-2">
						Event Name
					</Label>
					<Input
						id="event-name"
						placeholder="Event name here..."
						{...register('name', { required: true })}
					/>
					{errors.name && (
						<p className="pt-1 text-xs text-red-500">Name is required</p>
					)}
					{!errors.name && (
						<p className="pt-1 text-xs text-muted-foreground">
							Enter a name to title this storm event.
						</p>
					)}
				</div>
				<div className="flex w-full flex-row items-center justify-end space-x-2 pt-2 sm:pt-0 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel}>Cancel</AlertDialogCancel>
					<Button type="submit">Next</Button>
				</div>
			</AlertDialogFooter>
		</form>
	);
}

function FramePosDialogContent(props: DialogContentProps) {
	const [finished, setFinished] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [framePosData, setFramePosData] = useState<FramePosCallbackData[]>([]);
	const toaster = useToast();

	return (
		<>
			<DragAndDropZone
				type="framepos"
				processing={processing}
				onFiles={(files) => {
					setProcessing(files.length > 0);
				}}
				callback={(data) => {
					const framePosData = data as FramePosCallbackData[];

					if (framePosData.length === 0) {
						toaster.toast({
							title: 'No data',
							description: 'No data was recieved. Check the file format.',
							variant: 'destructive',
							duration: 5000,
						});
					} else {
						setFramePosData(framePosData);
						setFinished(true);
					}

					setProcessing(false);
				}}
			/>
			<AlertDialogFooter className="flex-col items-center pt-2 sm:space-y-2 md:flex-row md:justify-between">
				<DialogContentHeader
					index={1}
					title={
						<span>
							Upload the <code>framepos</code> text file
						</span>
					}
					description={
						'This stores the necessary geospatial data for each panorama.'
					}
				/>
				<div className="flex w-full flex-row items-center justify-end space-x-2 pt-2 sm:pt-0 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel} disabled={processing}>
						Cancel
					</AlertDialogCancel>
					<Button
						type="button"
						onClick={() => {
							if (framePosData.length === 0)
								toaster.toast({
									title: 'No data',
									description: 'No data was recieved.',
									variant: 'destructive',
									duration: 5000,
								});
							else props.onNext?.(framePosData);
						}}
						disabled={processing || !finished}
					>
						{processing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
						{processing ? 'Please wait' : 'Next'}
					</Button>
				</div>
			</AlertDialogFooter>
		</>
	);
}

function SurveyPanoramasDialogContent(props: DialogContentProps) {
	const [finished, setFinished] = useState(false);
	const [files, setFiles] = useState<File[]>([]);

	return (
		<>
			<DragAndDropZone
				type="survey"
				onFiles={(data) => {
					setFiles(data);

					if (data.length === props.formState.framepos.length)
						setFinished(true);
					else setFinished(false);
				}}
				processing={false}
			/>
			<AlertDialogFooter className="flex-col items-center pt-2 sm:space-y-2 md:flex-row md:justify-between">
				<DialogContentHeader
					index={2}
					title={'Upload the survey panoramas'}
					description={
						<>
							<span>
								<code>{`${files.length}/${props.formState.framepos.length}`}</code>
							</span>
							<span> panoramas uploaded.</span>
						</>
					}
				/>
				<div className="flex w-full flex-row items-center justify-end space-x-2 pt-2 sm:pt-0 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel}>Cancel</AlertDialogCancel>
					<Button
						type="button"
						disabled={!finished}
						onClick={() => props.onNext?.(files)}
					>
						Next
					</Button>
				</div>
			</AlertDialogFooter>
		</>
	);
}

function ComparisonPanoramasDialogContent(props: DialogContentProps) {
	const [finished, setFinished] = useState(false);
	const [uniquePanoramas, setUniquePanoramas] = useState<string[]>([]);
	const [files, setFiles] = useState<File[]>([]);
	const toaster = useToast();

	useEffect(() => {
		// Find the panoramas and do not include duplicates
		const panoramas = props.formState.framepos.map(
			(framepos) => framepos.pano_id
		);

		// Remove duplicates
		setUniquePanoramas([...new Set(panoramas)]);
	}, [props.formState.framepos]);

	return (
		<>
			<DragAndDropZone
				type="comparison"
				processing={false}
				onFiles={(data) => {
					setFiles(data);

					if (data.length === uniquePanoramas.length) setFinished(true);
					else setFinished(false);
				}}
			/>
			<AlertDialogFooter className="flex-col items-center pt-2 sm:space-y-2 md:flex-row md:justify-between">
				<DialogContentHeader
					index={3}
					title={'Upload the comparison panoramas'}
					description={
						<>
							<span>
								Click{' '}
								<a
									onClick={() => {
										void (async () => {
											if (typeof window !== 'undefined') {
												await navigator.clipboard.writeText(
													uniquePanoramas.join('\n')
												);
											}
										})();
										toaster.toast({
											title: 'Copied',
											description: 'Panorama IDs copied to clipboard.',
											duration: 3000,
										});
									}}
									className="cursor-pointer underline underline-offset-2"
								>
									here
								</a>{' '}
								to copy the panorama IDs to your clipboard.
							</span>
							<span>
								<code>{` ${files.length}/${uniquePanoramas.length} `}</code>
							</span>
							<span>panoramas uploaded.</span>
						</>
					}
				/>
				<div className="flex w-full flex-row items-center justify-end space-x-2 pt-2 sm:pt-0 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel}>Cancel</AlertDialogCancel>
					<Button
						type="button"
						disabled={!finished}
						onClick={() => props.onNext?.(files)}
					>
						Done
					</Button>
				</div>
			</AlertDialogFooter>
		</>
	);
}

export function New360ViewDialog() {
	const [page, setPage] = useState<
		'name' | 'framepos' | 'survey' | 'comparison'
	>('name');
	const [open, setOpen] = useState(false);
	const [formState, setFormState] = useState<FormStateData>({
		framepos: [],
		survey: [],
		comparison: [],
	});
	const { socket } = useWebSocketContext();
	const toaster = useToast();

	const handleOpen = (value: boolean) => {
		if (socket?.connected) setOpen(value);
		else {
			toaster.toast({
				title: 'Error',
				description: 'Not connected to server',
				duration: 5000,
				variant: 'destructive',
			});
			setOpen(false);
		}
	};

	const handleCancel = () => {
		console.log('cancel');
		setPage('name');
		setFormState({
			name: '',
			framepos: [],
			survey: [],
			comparison: [],
		});
	};

	useEffect(() => {
		socket?.on('disconnect', () => {
			setOpen(false);
		});
	}, [socket]);

	return (
		<AlertDialog open={open} onOpenChange={handleOpen}>
			<AlertDialogTrigger asChild>
				<Button className="ml-4" variant="outline">
					Upload a new event capture
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="md:max-w-2xl lg:max-w-4xl">
				{page === 'name' && (
					<NameDialogContent
						formState={formState}
						onNext={(data) => {
							setPage('framepos');
							setFormState({
								...formState,
								name: data as string,
							});
						}}
						onCancel={handleCancel}
					/>
				)}
				{page === 'framepos' && (
					<FramePosDialogContent
						formState={formState}
						onNext={(data) => {
							setPage('survey');
							setFormState({
								...formState,
								framepos: data as FramePosCallbackData[],
							});
						}}
						onCancel={handleCancel}
					/>
				)}
				{page === 'survey' && (
					<SurveyPanoramasDialogContent
						formState={formState}
						onNext={(data) => {
							setPage('comparison');
							setFormState({
								...formState,
								survey: data as File[],
							});
						}}
						onCancel={handleCancel}
					/>
				)}
				{page === 'comparison' && (
					<ComparisonPanoramasDialogContent
						formState={formState}
						onNext={(data) => {
							setPage('name');
							handleOpen(false);
							setFormState({
								...formState,
								comparison: data as File[],
							});
							console.log(formState);
						}}
						onCancel={handleCancel}
					/>
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
}
