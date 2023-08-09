import { DragAndDropZone } from '@/components/input/drag-and-drop-zone';
import { DialogContentHeader } from '../header';
import {
	AlertDialogCancel,
	AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { FormEvent, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DialogContentProps } from './types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitHandler, useForm } from 'react-hook-form';
import { api } from '@/utils/api';
import { env } from '@/env.mjs';
import { useSession } from 'next-auth/react';

type Inputs = {
	folder_name: string;
};

export const UploadDialogContent = (props: DialogContentProps) => {
	const session = useSession();
	const duplicateFolderName = api.scans.duplicateFolderName.useMutation();
	const [processing, setProcessing] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const toaster = useToast();

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: { errors },
	} = useForm<Inputs>();

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void (async () => {
			await handleSubmit((async (data) => {
				if (data.folder_name !== '') {
					if (
						await duplicateFolderName.mutateAsync({
							folder_name: data.folder_name,
						})
					) {
						return setError('folder_name', {
							type: 'validate',
							message: 'Folder name already exists',
						});
					}
				}

				if (!file) {
					toaster.toast({
						title: 'No file selected',
						description: 'Please select a file to upload.',
						duration: 5000,
					});

					return;
				}

				setProcessing(true);
				toaster.toast({
					title: 'Uploading...',
					description: 'Please wait while we upload your file.',
					duration: 5000,
				});

				const formData = new FormData();
				formData.append('user_id', session.data.user.id);
				if (data.folder_name !== '')
					formData.append('folder_name', data.folder_name);
				formData.append('pointcloud', file as File);

				const result = await fetch(
					`${env.NEXT_PUBLIC_BACKEND_URL}/api/upload/lidar`,
					{
						method: 'POST',
						body: formData,
					}
				);

				if (result.status !== 200) {
					toaster.toast({
						title: 'Upload failed',
						variant: 'destructive',
						description: 'Please try again later.',
						duration: 5000,
					});

					setProcessing(false);
					return;
				}

				toaster.toast({
					title: 'Upload created',
					description: 'Your file is now being processed.',
					duration: 5000,
				});

				const json = await result.json();

				let request = await fetch(
					`${env.NEXT_PUBLIC_BACKEND_URL}/api/upload/lidar/${json['scan_id']}`
				);

				if (request.status !== 200) {
					toaster.toast({
						title: 'Upload failed',
						variant: 'destructive',
						description: 'Cannot get upload status, try again later.',
						duration: 5000,
					});
					setProcessing(false);

					setFile(null);
					reset();

					props.onNext?.({
						scan_id: json['scan_id'] as string,
					});

					return;
				} else {
					let status = await request.json();

					while (status['upload_status'] === 'PROCESSING') {
						request = await fetch(
							`${env.NEXT_PUBLIC_BACKEND_URL}/api/upload/lidar/status/${json['scan_id']}`
						);

						if (request.status !== 200) {
							toaster.toast({
								title: 'Upload failed',
								variant: 'destructive',
								description: 'Cannot get upload status, try again later.',
								duration: 5000,
							});
							setProcessing(false);

							setFile(null);
							reset();

							props.onNext?.({
								scan_id: json['scan_id'] as string,
							});

							return;
						}

						status = await request.json();

						if (status['upload_status'] === 'FAILED') {
							toaster.toast({
								title: 'Upload failed',
								variant: 'destructive',
								description: 'Upload has failed, try again later.',
								duration: 5000,
							});
							setProcessing(false);

							setFile(null);
							reset();

							props.onNext?.({
								scan_id: json['scan_id'] as string,
							});

							break;
						} else if (status['upload_status'] === 'COMPLETED') {
							toaster.toast({
								title: 'Upload successful',
								description: 'Your file has been processed.',
								duration: 5000,
							});
							setProcessing(false);

							setFile(null);
							reset();

							props.onNext?.({
								scan_id: json['scan_id'] as string,
							});

							break;
						} else {
							await new Promise((resolve) => setTimeout(resolve, 2000));
						}
					}
				}
			}) as SubmitHandler<Inputs>)(event);
		})();
	};

	return (
		<form className="grid w-full gap-4" onSubmit={onSubmit}>
			<div className="flex flex-col">
				<Label htmlFor="folder-name" className="pb-2">
					Folder Name
				</Label>
				<Input
					id="folder-name"
					placeholder="Folder name here..."
					{...register('folder_name', {
						required: false,
						disabled: processing,
						minLength: 3,
						maxLength: 40,
						pattern: /^[a-zA-Z][a-zA-Z0-9-_]+$/,
					})}
				/>
				{errors.folder_name && (
					<p className="pt-1 text-xs text-red-500">
						{errors.folder_name.type === 'pattern' && 'Invalid folder name'}
						{errors.folder_name.type === 'minLength' &&
							'Folder name is too short'}
						{errors.folder_name.type === 'maxLength' &&
							'Folder name is too long'}
						{errors.folder_name.type === 'validate' &&
							errors.folder_name.message}
					</p>
				)}
				{!errors.folder_name && (
					<p className="text-muted-foreground pt-1 text-xs">
						Enter a folder name for this upload {'(optional)'}.
					</p>
				)}
			</div>
			<DragAndDropZone
				file_extensions={['.laz', '.las']}
				type="single"
				processing={processing}
				onFiles={(files) => setFile(files[0])}
			/>
			<AlertDialogFooter className="flex-col items-center pt-2 sm:space-y-2 md:flex-row md:justify-between">
				<DialogContentHeader
					index={1}
					title="Upload LAZ/LAS File"
					description="Upload a point cloud file to be converted to our format."
				/>
				<div className="flex w-full flex-row items-center justify-end space-x-2 md:w-auto">
					<AlertDialogCancel
						onClick={() => {
							setFile(null);
							reset();
							props.onCancel?.();
						}}
						disabled={processing}
					>
						Cancel
					</AlertDialogCancel>
					<Button type="submit" className="mt-2 sm:mt-0" disabled={processing}>
						{processing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
						{processing ? 'Please wait' : 'Next'}
					</Button>
				</div>
			</AlertDialogFooter>
		</form>
	);
};
