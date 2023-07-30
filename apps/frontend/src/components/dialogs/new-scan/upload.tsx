import { DragAndDropZone } from '@/components/input/drag-and-drop-zone';
import { DialogContentHeader } from '../header';
import {
	AlertDialogCancel,
	AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DialogContentProps } from './types';

export const UploadDialogContent = (props: DialogContentProps) => {
	const [finished, setFinished] = useState(false);
	const [processing, setProcessing] = useState(false);
	const toaster = useToast();

	return (
		<>
			<DragAndDropZone
				type="single"
				processing={processing}
				onFiles={(files) => {}}
			/>
			<AlertDialogFooter className="flex-col items-center pt-2 sm:space-y-2 md:flex-row md:justify-between">
				<DialogContentHeader
					index={1}
					title="Upload LAZ/LAS File"
					description="Upload a point cloud file to be converted to our format."
				/>
				<div className="flex w-full flex-row items-center justify-end space-x-2 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel} disabled={processing}>
						Cancel
					</AlertDialogCancel>
					<Button
						type="button"
						className="mt-2 sm:mt-0"
						onClick={() => {
							props.onNext?.();
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
