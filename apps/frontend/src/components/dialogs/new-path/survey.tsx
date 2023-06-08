import { useState } from 'react';
import type {
	DialogContentProps,
	ImageResult,
} from './types';
import type { Image360 } from '@prisma/client';
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
import { z } from 'zod';

export const SurveyPanoramasDialogContent = (props: DialogContentProps) => {
	const [finished, setFinished] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [processing, setProcessing] = useState(false);
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

		(async () => {
			const body = new FormData();

			const bufferFiles = await Promise.all(
				files.map(async (file) => {
					return {
						name: file.name,
						buffer: await file.arrayBuffer(),
					};
				})
			);

			body.append('path_id', props.formState.path_id.toString());

			for (const image of bufferFiles) {
				body.append('images', new Blob([image.buffer]), image.name);
			}

			const response = await fetch('/backend/api/upload', {
				method: 'POST',
				body: body,
			});

			if (!response.ok) {
				console.error('Failed to upload images. Make sure you are uploading < 4GB.', response.status);
				return null;
			}

			const data = await response.json();

			const responseType = z.array(
				z.object({
					image_name: z.string(),
					image_url: z.string(),
				})
			);

			if (!responseType.safeParse(data).success) {
				throw new Error('Invalid response from backend');
			}

			const result = responseType.parse(data) as ImageResult[];

			// If the images could not be uploaded
			if (!result || !result.length) {
				toaster.toast({
					title: 'Error',
					description: 'Images could not be uploaded to the server. Check the console for more information.',
					variant: 'destructive',
					duration: 5000,
				});

				setProcessing(false);
				return props.onCancel?.();
			}

			if (props.formState.path_id) {
				const images: Image360[] = [];

				for (const image of result) {
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
								images.push(result);
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
					surveys: images,
				});
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
