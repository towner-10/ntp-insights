import { DragAndDropZone } from '@/components/input/drag-and-drop-zone';
import type { FrameposResult } from '@/utils/types/framepos';
import type { DialogContentProps } from './types';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
	AlertDialogCancel,
	AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { DialogContentHeader } from '../header';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { processFramepos } from '@/lib/street_view';

export const FrameposDialogContent = (props: DialogContentProps) => {
	const [finished, setFinished] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [framePosData, setFramePosData] = useState<FrameposResult[]>([]);
	const [progress, setProgress] = useState(0);
	const toaster = useToast();

	const handleFiles = (files: File[]) => {
		setProcessing(files.length > 0);

		if (files.length > 0) {
			if (files[0]?.type !== 'text/plain' && files[0]?.type !== 'text/csv') {
				setProcessing(false);
				return toaster.toast({
					title: 'Error',
					description: 'File must be a text file.',
					variant: 'destructive',
					duration: 5000,
				});
			}

			void (async () => {
				if (!props.formState.path_id) {
					setProcessing(false);
					return toaster.toast({
						title: 'Error',
						description:
							'There was an error creating the path. You may not continue. Please try again.',
						variant: 'destructive',
						duration: 5000,
					});
				}

				const frameposResult = await processFramepos({
					path_id: props.formState.path_id,
					framepos: await files[0]?.text(),
					onProgress: (progress) => {
						setProgress(progress);
					},
				});

				if (!frameposResult.length) {
					toaster.toast({
						title: 'No data',
						description: 'No data was received. Check the file format.',
						variant: 'destructive',
						duration: 5000,
					});
				} else {
					console.log(frameposResult);
					setFramePosData(frameposResult);
					setFinished(true);
				}

				setProcessing(false);
			})();
		}
	};

	const currentDescription = () => {
		const baseDescription = `This stores the necessary geospatial data for each panorama.`;

		const missingPanos = framePosData.filter(
			(framepos) => !framepos.google_image
		);

		return finished ? (
			!missingPanos.length ? (
				baseDescription
			) : (
				<span>
					{baseDescription}{' '}
					{missingPanos && (
						<span className="font-bold">
							{missingPanos.length} Google panoramas could not be found!
						</span>
					)}
				</span>
			)
		) : (
			`${baseDescription}${
				progress > 0 ? ` (${(progress * 100).toFixed(1)}%)` : ''
			}`
		);
	};

	return (
		<>
			<DragAndDropZone
				file_extensions={['.txt', '.csv']}
				type="single"
				processing={processing}
				onFiles={handleFiles}
			/>
			<AlertDialogFooter className="flex-col items-center pt-2 sm:space-y-2 md:flex-row md:justify-between">
				<DialogContentHeader
					index={1}
					title={
						<span>
							Upload the <code>framepos</code> text file
						</span>
					}
					description={currentDescription()}
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
									description: 'No data was received.',
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
};
