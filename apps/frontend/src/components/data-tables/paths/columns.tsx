import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Frame, Link2Icon } from 'lucide-react';
import { format } from 'date-fns';
import ClipboardButton from '@/components/buttons/clipboard-button';
import { type Path } from '@prisma/client';
import { UserHoverCard } from '@/components/user-hover-card';
import Link from 'next/link';
import { PathContextMenu } from '@/components/dialogs/path-context-menu';

export const columns = (onRefresh: () => void) => {
	return [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => {
				const path = row.original;

				return (
					<Link href={`/360/${path.id}/view`}>
						<Button variant={'link'}>{path.name}</Button>
					</Link>
				);
			},
		},
		{
			accessorKey: 'created_by_id',
			header: 'Created by',
			cell: ({ row }) => {
				return <UserHoverCard id={row.original.created_by_id} />;
			},
		},
		{
			accessorKey: 'date',
			header: ({ column }) => {
				return (
					<a
						className="flex cursor-pointer flex-row items-center text-left hover:text-primary hover:underline"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					>
						{'Date created'}
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</a>
				);
			},
			cell: ({ row }) => {
				const path = row.original;

				return <span>{format(path.date, 'MMMM d, yyyy')}</span>;
			},
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => {
				const path = row.original;

				const copyLink = () => {
					if (typeof window !== 'undefined') {
						const hostname = window.location.hostname;

						return `${hostname}/360/${path.id}/view`;
					}

					return 'Not available';
				};

				const copyFrame = () => {
					if (typeof window !== 'undefined') {
						const hostname = window.location.hostname;

						return `<iframe src="${hostname}/360/${path.id}/frame" width="800" height="600" />`;
					}

					return 'Not available';
				}

				return (
					<div className="flex gap-2">
						<ClipboardButton
							text={copyFrame()}
							notify
							tooltip="Copy to clipboard"
						>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<Frame className="h-4 w-4" />
							</Button>
						</ClipboardButton>
						<ClipboardButton
							text={copyLink()}
							notify
							tooltip="Copy to clipboard"
						>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<Link2Icon className="h-4 w-4" />
							</Button>
						</ClipboardButton>
						<PathContextMenu
							path={path}
							link={copyLink()}
							onRefresh={onRefresh}
						/>
					</div>
				);
			},
		},
	] as ColumnDef<Path>[];
};
