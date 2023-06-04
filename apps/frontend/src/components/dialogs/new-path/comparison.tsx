import { useEffect, useState } from "react";
import type { CallbackData, DialogContentProps, ImageResult, UploadData } from "./types";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/use-toast";
import { useWebSocketContext } from "@/components/socket-context";
import parseISO from "date-fns/parseISO";
import { DragAndDropZone } from "@/components/input/drag-and-drop-zone";
import { AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { DialogContentHeader } from "./header";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const ComparisonPanoramasDialogContent = (props: DialogContentProps) => {
	const [finished, setFinished] = useState(false);
	const [uniquePanoramas, setUniquePanoramas] = useState<string[]>([]);
	const [files, setFiles] = useState<File[]>([]);
	const [processing, setProcessing] = useState(false);
	const newGoogleImage = api.image360.newGoogleImage.useMutation();
	const setBeforeImage = api.image360.setBeforeImage.useMutation();
	const { socket } = useWebSocketContext();
	const toaster = useToast();

	useEffect(() => {
		// Find the panoramas and do not include duplicates
		const panoramas = props.formState.framepos.map(
			(framepos) => framepos.google_image.pano_id
		);

		// Remove duplicates
		setUniquePanoramas([...new Set(panoramas)]);
	}, [props.formState.framepos]);

	const handleUpload = () => {
		setProcessing(true);

		// Check if the files match the pano_ids
		if (
			!files.every((file) =>
				uniquePanoramas.some(
					(panorama) => panorama === (file.name.split('.')[0])
				)
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

		// TODO: This is not secure, but is the only way to send files to the server as of now
		socket?.compress(false).emit(
			'upload',
			{
				uploadType: 'comparison',
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
								(framepos) =>
									framepos.google_image.pano_id ===
									image.image_name.split('.')[0]
							);
							const file = files.find((file) => file.name === image.image_name);

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
								} else {
									const image_ids = [
										...props.formState.surveys
											.filter((survey) => {
												return props.formState.framepos
													.filter((framepos) => {
														return (
															framepos.google_image.pano_id ===
															image.image_name.split('.')[0]
														);
													})
													.some((framepos) => {
														return framepos.frame_index === survey.index;
													});
											})
											.map((survey) => survey.id),
									];

									const before = await setBeforeImage.mutateAsync({
										before_image_id: result.id,
										image_ids,
									});

									if (!before) {
										toaster.toast({
											title: 'Error',
											description: '',
											variant: 'destructive',
											duration: 5000,
										});

										return props.onCancel?.();
									}
								}

								setProcessing(false);
							} else {
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

					toaster.toast({
						title: 'Success',
						description:
							'Path created in database with images. You can now view the path in the dashboard.',
						duration: 5000,
					});
					props.onNext?.();
				}
			}
		);
	};

	return (
		<>
			<DragAndDropZone
				type="comparison"
				processing={processing}
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
}