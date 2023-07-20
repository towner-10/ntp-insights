import { useEffect, useRef, useState } from 'react';
import type { DialogContentProps } from './types';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/use-toast';
import parseISO from 'date-fns/parseISO';
import { DragAndDropZone } from '@/components/input/drag-and-drop-zone';
import {
	AlertDialogCancel,
	AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { DialogContentHeader } from './header';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { batchUploadImages } from './helpers';
import { Prisma } from 'database';

export const ComparisonPanoramasDialogContent = (props: DialogContentProps) => {
	const downloadRef = useRef<HTMLAnchorElement>(null);
	const [finished, setFinished] = useState(false);
	const [uniquePanoramas, setUniquePanoramas] = useState<string[]>([]);
	const [files, setFiles] = useState<File[]>([]);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const newGoogleImage = api.image360.newGoogleImage.useMutation();
	const setBeforeImage = api.image360.setBeforeImage.useMutation();
	const toaster = useToast();

	useEffect(() => {
		// Find the panoramas and do not include duplicates
		const panoramas = props.formState.framepos.map((framepos) => {
			if (!framepos.google_image) return;
			return framepos.google_image.pano_id;
		});

		// Remove duplicates
		setUniquePanoramas([...new Set(panoramas)]);
	}, [props.formState.framepos]);

	const handleUpload = () => {
		setProcessing(true);

		// Check if the files match the pano_ids
		if (
			!files.every((file) =>
				uniquePanoramas.some((panorama) => panorama === file.name.split('.')[0])
			)
		) {
			toaster.toast({
				title: 'Error',
				description:
					'The files do not match the expected names. Please upload the correct files.',
				variant: 'destructive',
				duration: 5000,
			});

			return setProcessing(false);
		}

		// Check if the path_id is defined
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

			const promises: Promise<Prisma.BatchPayload>[] = [];

			for (const image of result) {
				const pano_id = image.image_name.split('.').shift()!;

				// Fetch image data from the form state
				const framepos = props.formState.framepos.find(
					(framepos) => framepos.google_image.pano_id.trim() === pano_id.trim()
				);
				const file = files.find(
					(file) => file.name.trim() === image.image_name.trim()
				);

				// If the required data is present
				if (
					image.image_url &&
					file &&
					framepos?.google_image.lng &&
					framepos?.google_image.lat
				) {
					// Create the image in the database
					const result = await newGoogleImage.mutateAsync({
						path_id: props.formState.path_id,
						image_size: file.size,
						url: image.image_url,
						lng: framepos?.google_image.lng,
						lat: framepos?.google_image.lat,
						heading: framepos?.google_image.heading,
						pitch: framepos?.google_image.pitch,
						roll: framepos?.google_image.roll,
						date_taken: framepos.google_image.date
							? parseISO(framepos.google_image.date)
							: undefined,
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
					}

					// Find image indexes that match the current image pano_id
					const image_indexes = props.formState.framepos
						.filter((framepos) => {
							return framepos.google_image.pano_id === pano_id;
						})
						.map((framepos) => framepos.frame_index);

					promises.push(
						setBeforeImage.mutateAsync({
							before_image_id: result.id,
							image_indexes,
						})
					);
				} else {
					toaster.toast({
						title: 'Error',
						description: 'Image could not be created in database.',
						variant: 'destructive',
						duration: 5000,
					});

					return props.onCancel?.();
				}
			}

			await Promise.all(promises);

			toaster.toast({
				title: 'Success',
				description:
					'Path created in database with images. You can now view the path in the dashboard.',
				duration: 5000,
			});
			setProcessing(false);
			props.onNext?.();
		})();
	};

	return (
		<>
			<DragAndDropZone
				type="comparison"
				processing={processing}
				onFiles={(data) => {
					setFiles(data);

					if (uniquePanoramas.length >= 1) setFinished(true);
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
								Click to{' '}
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
									copy
								</a>{' '}
								/{' '}
								<a
									ref={downloadRef}
									onClick={() => {
										const fileData = uniquePanoramas.join('\n');
										const file = new Blob([fileData], { type: "text/plain" });
										downloadRef.current!.href = URL.createObjectURL(file);
										downloadRef.current!.download = 'panorama_ids.txt';

										toaster.toast({
											title: 'Downloaded',
											description: 'Panorama IDs have been downloaded.',
											duration: 3000,
										});
									}}
									className="cursor-pointer underline underline-offset-2"
								>
									download
								</a>{' '}
								the panorama IDs.
							</span>
							<span>
								<code>{` ${files.length} `}</code>
							</span>
							<span>panoramas selected.</span>
							{progress > 0 && (
								<span>
									{' '}
									<code>{`(${progress.toFixed(2)}%)`}</code>
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
						{processing ? 'Uploading' : 'Done'}
					</Button>
				</div>
			</AlertDialogFooter>
		</>
	);
};
