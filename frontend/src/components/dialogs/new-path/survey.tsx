import { useState } from 'react';
import type {
	CallbackData,
	DialogContentProps,
	ImageResult,
	UploadData,
} from './types';
import type { Image360 } from '@prisma/client';
import { api } from '@/utils/api';
import { useWebSocketContext } from '@/components/socket-context';
import { useToast } from '@/components/ui/use-toast';
import { DragAndDropZone } from '@/components/input/drag-and-drop-zone';
import {
	AlertDialogCancel,
	AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { DialogContentHeader } from './header';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const SurveyPanoramasDialogContent = (props: DialogContentProps) => {
	const [finished, setFinished] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [processing, setProcessing] = useState(false);
	const newNTPImage = api.image360.newNTP.useMutation();
	const { socket } = useWebSocketContext();
	const toaster = useToast();

	const handleUpload = () => {
		setProcessing(true);

		// Check if the files match the framepos
		if (
			!files.every((file) =>
				props.formState.framepos.some(
					(framepos) => framepos.file_name === file.name
				)
			)
		) {
			toaster.toast({
				title: 'Error',
				description:
					'The files do not match the framepos. Please upload the correct files.',
				variant: 'destructive',
				duration: 5000,
			});

			setProcessing(false);
			return;
		}

		// TODO: This is not secure, but is the only way to send files to the server as of now
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
					const surveys: Image360[] = [];

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
								file &&
								(framepos?.frame_index != undefined ||
									framepos?.frame_index != null) &&
								framepos?.lng &&
								framepos?.lat
							) {
								// Create the image in the database
								const result = await newNTPImage.mutateAsync({
									path_id: props.formState.path_id as string,
									index: framepos?.frame_index,
									image_size: file.size,
									date_taken: new Date(file.lastModified),
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

									return props.onCancel?.();
								} else {
									surveys.push(result);
								}
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
								return props.onCancel?.();
							}
						})();
					}

					props.onNext?.();
					setProcessing(false);
					props.setFormState({
						...props.formState,
						surveys,
					});
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
};
