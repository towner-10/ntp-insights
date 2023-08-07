import { type ColumnDef } from '@tanstack/react-table';
import { Path } from 'database';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Frame, Link2Icon } from 'lucide-react';
import { format } from 'date-fns';
import ClipboardButton from '@/components/buttons/clipboard-button';
import { UserHoverCard } from '@/components/user-hover-card';
import Link from 'next/link';
import { PathContextMenu } from '@/components/dialogs/path-context-menu';

export const columns = (onRefresh: () => void) => {
	return [
		{
			accessorKey: 'name',
			header: () => {
				return (
					<a
					className="flex flex-row pl-4"
					>
						{'Name'}
					</a>
				)
			},
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
						className="flex cursor-pointer flex-row items-center hover:text-primary hover:underline"
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
			header: () => {
				return (
					<a
					className="flex flex-row pl-8"
					>
						{'Actions'}
					</a>
				)
			},
			cell: ({ row }) => {
				const path = row.original;

				const copyLink = () => {
					if (typeof window !== 'undefined') {
						const protocol = window.location.protocol;
						const host = window.location.host;

						return `${protocol}//${host}/360/${path.id}/view`;
					}

					return 'Not available';
				};

				const copyFrame = () => {
					if (typeof window !== 'undefined') {
						const protocol = window.location.protocol;
						const host = window.location.host;

						return `<iframe src="${protocol}//${host}/360/${path.id}/frame" width="800" height="600" />`;
					}

					return 'Not available';
				}

				return (
					<div className="flex gap-2">
						<ClipboardButton
							text={copyLink()}
							notify
							tooltip="Copy shareable link to clipboard"
						>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<Link2Icon className="h-4 w-4" />
							</Button>
						</ClipboardButton>
						<ClipboardButton
							text={copyFrame()}
							notify
							tooltip="Copy inline frame to clipboard"
						>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<Frame className="h-4 w-4" />
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
