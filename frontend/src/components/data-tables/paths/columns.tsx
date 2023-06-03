import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, Link2Icon, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import ClipboardButton from '@/components/buttons/clipboard-button';
import { type Path } from '@prisma/client';
import { UserHoverCard } from '@/components/user-hover-card';
import Link from 'next/link';
import { DeletePathDialog } from '@/components/dialogs/delete-path-dialog';

export const columns: ColumnDef<Path>[] = [
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
				<Button
					variant="ghost"
					className="text-left"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					{'Date created'}
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
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

					// TODO: Change this to the actual hostname
					return `${hostname}:3000/360/${path.id}/view`;
				}

				return 'Not available';
			};

			return (
				<div>
					<ClipboardButton text={copyLink()} notify>
						<Link2Icon className="h-4 w-4" />
					</ClipboardButton>
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
							<Link href={`/360/${path.id}/view`}>
								<DropdownMenuItem>View</DropdownMenuItem>
							</Link>
							<DropdownMenuItem
								onClick={() => {
									void navigator.clipboard.writeText(copyLink());
								}}
							>
								Copy link
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Rename</DropdownMenuItem>
							<DeletePathDialog path={path}>
								<DropdownMenuItem>Delete</DropdownMenuItem>
							</DeletePathDialog>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];
