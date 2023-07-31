import { type ColumnDef } from '@tanstack/react-table';
import { Scan } from 'database';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Frame, Link2Icon } from 'lucide-react';
import { format } from 'date-fns';
import ClipboardButton from '@/components/buttons/clipboard-button';
import { UserHoverCard } from '@/components/user-hover-card';
import Link from 'next/link';
import { PathContextMenu } from '@/components/dialogs/path-context-menu';
import { ScanContextMenu } from '@/components/dialogs/scan-context-menu';

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
					<Link href={`/lidar/${path.id}/view`}>
						<Button variant={'link'}>{path.name || 'N/A'}</Button>
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
						{'Date taken'}
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</a>
				);
			},
			cell: ({ row }) => {
				if (!row.original.date_taken) {
					return <span>{'N/A'}</span>;
				}

				const path = row.original;

				return <span>{format(path.date_taken, 'MMMM d, yyyy')}</span>;
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
				const scan = row.original;

				const copyLink = () => {
					if (typeof window !== 'undefined') {
						const hostname = window.location.hostname;

						return `${hostname}/lidar/${scan.id}/view`;
					}

					return 'Not available';
				};

				const copyFrame = () => {
					if (typeof window !== 'undefined') {
						const hostname = window.location.hostname;

						return `<iframe src="${hostname}/lidar/${scan.id}/frame" width="800" height="600" />`;
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
						<ScanContextMenu
							scan={scan}
							link={copyLink()}
							onRefresh={onRefresh}
						/>
					</div>
				);
			},
		},
	] as ColumnDef<Scan>[];
};
