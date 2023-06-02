import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogTrigger,
} from '../ui/alert-dialog';
import { type FormEvent, useEffect, useState } from 'react';
import { DragAndDropZone } from '../input/drag-and-drop-zone';
import { Input } from '../ui/input';
import { useWebSocketContext } from '../socket-context';
import { useToast } from '../ui/use-toast';
import { Controller, useForm } from 'react-hook-form';
import { Loader2, LucideFootprints } from 'lucide-react';
import { DatePicker } from '../ui/date-picker';
import { api } from '@/utils/api';

type DialogContentProps = {
	formState: FormStateData;
	setFormState: (data: FormStateData) => void;
	onNext?: () => void;
	onCancel?: () => void;
};

type Panorama = {
	pano_id: string;
	lat: number;
	lng: number;
	heading: number;
	pitch: number;
	roll: number;
	date: string | null;
};

// Row data from framepos.txt
type FramePosResult = {
	frame_index: number;
	lat: number;
	lng: number;
	altitude: number;
	distance: number;
	heading: number;
	pitch: number;
	roll: number;
	track: number;
	file_name: string;
	google_image: Panorama;
};

type ImageResult = {
	image_name: string;
	image_url?: string;
};

// Data received from client
type UploadData = {
	uploadType: 'framepos' | 'survey' | 'comparison';
	id?: string;
	files: {
		name: string;
		buffer: File;
	}[];
};

// Data sent to client
type CallbackData = FramePosResult[] | ImageResult[] | null;

type FormStateData = {
	name: string;
	date: Date;
	path_id?: string;
	framepos: FramePosResult[];
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

function InitialDialogContent(props: DialogContentProps) {
	type Inputs = {
		name: string;
		date: Date;
	};

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<Inputs>();

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void (async () => {
			await handleSubmit((data) => {
				props.setFormState({
					...props.formState,
					name: data.name,
					date: data.date,
				});
				props.onNext?.();
			})(event);
		})();
	};

	return (
		<form onSubmit={onSubmit}>
			<div className="flex-col items-center sm:space-y-2 md:flex-row md:justify-between">
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
				<div className="flex w-full flex-col pt-4 md:w-96 lg:w-[500px]">
					<Label htmlFor="event-date" className="pb-2">
						Event Date
					</Label>
					<Controller
						name="date"
						control={control}
						rules={{ required: true }}
						render={({ field }) => {
							return (
								<DatePicker
									id="event-date"
									className="w-full"
									value={field.value}
									onChange={(e) => {
										field.onChange(e);
									}}
								/>
							);
						}}
					/>
					{errors.date && (
						<p className="pt-1 text-xs text-red-500">Date is required</p>
					)}
					{!errors.date && (
						<p className="pt-1 text-xs text-muted-foreground">
							Enter the date of this storm event.
						</p>
					)}
				</div>
			</div>
			<AlertDialogFooter>
				<div className="flex w-full flex-row items-center justify-end space-x-2 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel}>Cancel</AlertDialogCancel>
					<Button
						type="submit"
						disabled={errors.name !== undefined || errors.date !== undefined}
						className="mt-2 sm:mt-0"
					>
						Next
					</Button>
				</div>
			</AlertDialogFooter>
		</form>
	);
}

function FramePosDialogContent(props: DialogContentProps) {
	const [finished, setFinished] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [framePosData, setFramePosData] = useState<FramePosResult[]>([]);
	const { socket } = useWebSocketContext();
	const toaster = useToast();

	return (
		<>
			<DragAndDropZone
				type="framepos"
				processing={processing}
				onFiles={(files) => {
					setProcessing(files.length > 0);

					if (socket?.connected) {
						socket?.compress(false).emit(
							'upload',
							{
								uploadType: 'framepos',
								files: Array.from(files).map((file) => {
									return {
										name: file.name,
										buffer: file,
									};
								}),
							} as UploadData,
							(data: CallbackData) => {
								const framePosData = data as FramePosResult[];

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
							}
						);
					}
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
				<div className="flex w-full flex-row items-center justify-end space-x-2 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel} disabled={processing}>
						Cancel
					</AlertDialogCancel>
					<Button
						type="button"
						className="mt-2 sm:mt-0"
						onClick={() => {
							if (framePosData.length) {
								props.onNext?.();
								props.setFormState({
									...props.formState,
									framepos: framePosData,
								});
							} else {
								toaster.toast({
									title: 'No data',
									description: 'No data was recieved.',
									variant: 'destructive',
									duration: 5000,
								});
							}
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
	const [processing, setProcessing] = useState(false);
	const newNTPImage = api.image360.newNTP.useMutation();
	const { socket } = useWebSocketContext();
	const toaster = useToast();

	const handleUpload = () => {
		setProcessing(true);
		socket?.compress(false).emit(
			'upload',
			{
				uploadType: 'survey',
				id: props.formState.path_id,
				files: Array.from(files).map((file) => {
					return {
						name: file.name,
						buffer: file,
					};
				}),
			} as UploadData,
			(data: CallbackData) => {
				const images = data as ImageResult[];

				if (props.formState.path_id) {
					for (const image of images) {
						void (async () => {
							// Fetch image data from the form state
							const framepos = props.formState.framepos.find(
								(framepos) => framepos.file_name === image.image_name
							);
							const file = files.find((file) => file.name === image.image_name);

							// If the required data is present
							if (
								image.image_url &&
								file?.size &&
								(framepos?.frame_index != undefined ||
									framepos?.frame_index != null) &&
								framepos?.lng &&
								framepos?.lat
							) {
								// Create the image in the database
								const result = await newNTPImage.mutateAsync({
									path_id: props.formState.path_id as string,
									index: framepos?.frame_index,
									image_size: file?.size,
									url: image.image_url,
									lng: framepos?.lng,
									lat: framepos?.lat,
									heading: framepos?.heading,
									altitude: framepos?.altitude,
									distance: framepos?.distance,
									pitch: framepos?.pitch,
									roll: framepos?.roll,
									track: framepos?.track,
								});

								// If the image could not be created in the database
								if (!result) {
									toaster.toast({
										title: 'Error',
										description: 'Image could not be created in database.',
										variant: 'destructive',
										duration: 5000,
									});

									props.onCancel?.();
								} else {
									props.onNext?.();
								}

								setProcessing(false);
							} else {
								// When the required data is not present
								console.log(
									image.image_url,
									file?.size,
									framepos?.frame_index,
									framepos?.lng,
									framepos?.lat
								);

								toaster.toast({
									title: 'Error',
									description: 'Image could not be created in database.',
									variant: 'destructive',
									duration: 5000,
								});
								props.onCancel?.();
							}
						})();
					}
				}
			}
		);
	};

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
				processing={processing}
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
				<div className="flex w-full flex-row items-center justify-end space-x-2 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel} disabled={processing}>
						Cancel
					</AlertDialogCancel>
					<Button
						type="button"
						className="mt-2 sm:mt-0"
						disabled={!finished || processing}
						onClick={handleUpload}
					>
						{processing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
						{processing ? 'Uploading' : 'Next'}
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
			(framepos) => framepos.google_image.pano_id
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
				<div className="flex w-full flex-row items-center justify-end space-x-2 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel}>Cancel</AlertDialogCancel>
					<Button
						type="button"
						className="mt-2 sm:mt-0"
						disabled={!finished}
						onClick={() => {
							props.setFormState({
								...props.formState,
								comparison: files,
							});
							props.onNext?.();
						}}
					>
						Done
					</Button>
				</div>
			</AlertDialogFooter>
		</>
	);
}

export function NewPathDialog() {
	const [page, setPage] = useState<
		'initial' | 'framepos' | 'survey' | 'comparison'
	>('initial');
	const [open, setOpen] = useState(false);
	const [formState, setFormState] = useState<FormStateData>({
		name: '',
		date: new Date(),
		framepos: [],
		survey: [],
		comparison: [],
	});
	const newPath = api.paths.new.useMutation();
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
		setOpen(false);
		setPage('initial');
		setFormState({
			name: '',
			date: new Date(),
			framepos: [],
			survey: [],
			comparison: [],
		});
	};

	const handleError = (error?: string) => {
		toaster.toast({
			title: 'Error',
			description: error ?? 'Something went wrong.',
			duration: 5000,
			variant: 'destructive',
		});

		handleCancel();
	};

	const initialSubmit = (data: FormStateData) => {
		void (async () => {
			const path = await newPath.mutateAsync({
				name: data.name,
				date: data.date,
			});

			if (path) {
				toaster.toast({
					title: 'Success',
					description: 'Path created in database.',
					duration: 5000,
				});

				setFormState({
					...data,
					path_id: path.id,
				});
			} else
				handleError('Path could not be created in database. Try again later.');
		})();
	};

	useEffect(() => {
		socket?.on('disconnect', () => {
			setOpen(false);
		});
	}, [socket]);

	return (
		<AlertDialog open={open} onOpenChange={handleOpen}>
			<AlertDialogTrigger asChild>
				<Button>
					<LucideFootprints className="pr-2" />
					New Path
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="md:max-w-2xl lg:max-w-4xl">
				{page === 'initial' && (
					<InitialDialogContent
						formState={formState}
						setFormState={initialSubmit}
						onNext={() => setPage('framepos')}
						onCancel={handleCancel}
					/>
				)}
				{page === 'framepos' && (
					<FramePosDialogContent
						formState={formState}
						setFormState={setFormState}
						onNext={() => setPage('survey')}
						onCancel={handleCancel}
					/>
				)}
				{page === 'survey' && (
					<SurveyPanoramasDialogContent
						formState={formState}
						setFormState={setFormState}
						onNext={() => setPage('comparison')}
						onCancel={handleCancel}
					/>
				)}
				{page === 'comparison' && (
					<ComparisonPanoramasDialogContent
						formState={formState}
						setFormState={(data) => {
							setFormState(data);
							console.log(data);
						}}
						onNext={() => {
							setPage('initial');
							handleOpen(false);
						}}
						onCancel={handleCancel}
					/>
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
}
