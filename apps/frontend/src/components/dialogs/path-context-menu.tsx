import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import ClipboardButton from '../buttons/clipboard-button';
import { useToast } from '../ui/use-toast';
import { type FormEvent, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog';
import { api } from '@/utils/api';
import { Path } from 'database';
import { Input } from '../ui/input';
import { type SubmitHandler, useForm } from 'react-hook-form';

type Input = {
	name: string;
};

export function PathContextMenu(props: {
	path: Path;
	link: string;
	onRefresh: () => void;
}) {
	const toaster = useToast();
	const archivePath = api.paths.archive.useMutation();
	const renamePath = api.paths.rename.useMutation();
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<Input>();
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);
	const [showRenameDialog, setShowRenameDialog] = useState(false);

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		void (async () => {
			await handleSubmit((async (data) => {
				const path = await renamePath.mutateAsync({
					id: props.path.id,
					name: data.name,
				});

				if (path) {
					toaster.toast({
						title: 'Path renamed.',
						description: 'The path has been renamed.',
						duration: 5000,
					});
					setShowRenameDialog(false);
					props.onRefresh();
				}
			}) as SubmitHandler<Input>)(event);
		})();
	};

	return (
		<Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
			<AlertDialog
				open={showDeleteAlert && !showRenameDialog}
				onOpenChange={setShowDeleteAlert}
			>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<Link href={`/360/${props.path.id}/view`}>
							<DropdownMenuItem>View</DropdownMenuItem>
						</Link>
						<ClipboardButton text={props.link} notify>
							<DropdownMenuItem>Copy link</DropdownMenuItem>
						</ClipboardButton>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => {
								setValue('name', props.path.name);
								setShowRenameDialog(true);
							}}
						>
							Rename
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setShowDeleteAlert(true)}>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Do you want to delete this path?
						</AlertDialogTitle>
						<AlertDialogDescription>
							When you complete this action, it will be archived and you can
							request to restore it later.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								void archivePath.mutateAsync({ id: props.path.id }).then(() => {
									toaster.toast({
										title: 'Path archived.',
										description: 'Request to restore it later.',
										duration: 5000,
									});
									props.onRefresh();
								});
							}}
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Rename path</DialogTitle>
					<DialogDescription>
						<p>Enter a new name for this path.</p>
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit}>
					<Input
						type="text"
						placeholder="New name"
						{...register('name', {
							required: true,
						})}
					/>
					{errors.name && <span>This field is required</span>}
					<DialogFooter className="pt-4">
						<Button
							variant="outline"
							onClick={() => {
								setValue('name', '');
								setShowRenameDialog(false);
							}}
						>
							Cancel
						</Button>
						<Button type="submit">Rename</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
