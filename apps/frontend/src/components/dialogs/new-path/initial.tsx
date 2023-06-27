import { type FormEvent } from 'react';
import type { DialogContentProps } from './types';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
	AlertDialogCancel,
	AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/utils/api';

export const InitialDialogContent = (props: DialogContentProps) => {
	type Inputs = {
		name: string;
		folder_name: string;
		date: Date;
	};

	const {
		register,
		handleSubmit,
		control,
		setError,
		formState: { errors },
	} = useForm<Inputs>();

	const duplicateFolderName = api.paths.duplicateFolderName.useMutation();

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void (async () => {
			await handleSubmit((async (data) => {
				if (
					await duplicateFolderName.mutateAsync({
						folder_name: data.folder_name,
					})
				) {
					setError('folder_name', {
						type: 'validate',
						message: 'Folder name already exists',
					});

					return;
				}

				props.setFormState({
					...props.formState,
					name: data.name,
					folder_name: data.folder_name,
					date: data.date,
				});

				props.onNext?.();
			}) as SubmitHandler<Inputs>)(event);
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
						<p className="text-muted-foreground pt-1 text-xs">
							Enter a name to title this storm event.
						</p>
					)}
				</div>
				<div className="flex w-full flex-col pt-4 md:w-96 lg:w-[500px]">
					<Label htmlFor="folder-name" className="pb-2">
						Folder Name
					</Label>
					<Input
						id="folder-name"
						placeholder="Folder name here..."
						{...register('folder_name', {
							required: true,
							minLength: 3,
							maxLength: 50,
							pattern: /^[a-zA-Z][a-zA-Z0-9-_]+$/,
						})}
					/>
					{errors.folder_name?.type === 'required' && (
						<p className="pt-1 text-xs text-red-500">Folder name is required</p>
					)}
					{errors.folder_name?.type === 'minLength' && (
						<p className="pt-1 text-xs text-red-500">
							Folder name is too short
						</p>
					)}
					{errors.folder_name?.type === 'maxLength' && (
						<p className="pt-1 text-xs text-red-500">Folder name is too long</p>
					)}
					{errors.folder_name?.type === 'pattern' && (
						<p className="pt-1 text-xs text-red-500">
							Folder name must start with a letter and contain only letters,
							numbers, dashes, and underscores
						</p>
					)}
					{errors.folder_name?.type === 'validate' && (
						<p className="pt-1 text-xs text-red-500">
							{errors.folder_name?.message}
						</p>
					)}
					{!errors.folder_name && (
						<p className="text-muted-foreground pt-1 text-xs">
							Enter a for the folder images are stored in.
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
						<p className="text-muted-foreground pt-1 text-xs">
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
};
