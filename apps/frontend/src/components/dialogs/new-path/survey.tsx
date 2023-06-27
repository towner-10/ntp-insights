import { useState } from 'react';
import type { DialogContentProps } from './types';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/use-toast';
import { DragAndDropZone } from '@/components/input/drag-and-drop-zone';
import {
	AlertDialogCancel,
	AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { DialogContentHeader } from './header';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Image360Data } from '@/utils/types/image360Data';
import { batchUploadImages } from './helpers';

export const SurveyPanoramasDialogContent = (props: DialogContentProps) => {
	const [finished, setFinished] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const newNTPImage = api.image360.newNTP.useMutation();
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

		if (!props.formState.path_id) {
			toaster.toast({
				title: 'Error',
				description: 'Path ID is not defined.',
				variant: 'destructive',
				duration: 5000,
			});

			setProcessing(false);
			return props.onCancel?.();
		}

		(async () => {
			const result = await batchUploadImages(
				files,
				props.formState.folder_name,
				props.formState.path_id,
				({ userMessage, consoleMessage }) => {
					console.error(consoleMessage);
					toaster.toast({
						title: 'Error',
						description: userMessage,
						variant: 'destructive',
						duration: 5000,
					});
					setProcessing(false);
					props.onCancel?.();
				},
				(sent, total) => {
					setProgress((sent / total) * 100);
				}
			);

			if (!result) return;

			const images: Image360Data[] = [];

			for (const image of result) {
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
					images.push({
						path_id: props.formState.path_id,
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
			}

			// Create the images in the database
			try {
				await newNTPImage.mutateAsync(images);
				props.onNext?.();
			} catch (error) {
				console.error(error);
				toaster.toast({
					title: 'Error',
					description: 'Image could not be created in database.',
					variant: 'destructive',
					duration: 5000,
				});

				props.onCancel?.();
			} finally {
				setProcessing(false);
			}
		})();
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
							{progress > 0 && (
								<span>
									{' '}
									<code>{`${progress.toFixed(2)}%`}</code> complete.
								</span>
							)}
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
