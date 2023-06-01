import dayjs from 'dayjs';
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
import { ArrowUpDown, MoreHorizontal, UploadIcon } from 'lucide-react';

export type Upload = {
	id: string;
	name: string;
	author: string;
	date: Date;
};

export const uploads: Upload[] = [
	{
		id: '1',
		name: 'NTP 2023 Storm Event',
		author: 'Tornado Man',
		date: dayjs('05-29-2023').toDate(),
	},
	{
		id: '2',
		name: 'London 2022 Derecho',
		author: 'Kevin Manka',
		date: dayjs('05-18-2022').toDate(),
	},
	{
		id: '3',
		name: 'Barrie 2021 Tornado',
		author: 'Collin Town',
		date: dayjs('07-17-2021').toDate(),
	},
];

export const columns: ColumnDef<Upload>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
	},
	{
		accessorKey: 'author',
		header: 'Created by',
	},
	{
		accessorKey: 'date',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					{'Date created'}
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		cell: ({ row }) => {
			const upload = row.original;

			return <span>{dayjs(upload.date).format('MMMM D, YYYY')}</span>;
		}
	},
	{
		id: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			const upload = row.original;

			return (
				<div>
					<Button
						onClick={() => void navigator.clipboard.writeText(upload.id)}
						variant="ghost"
						className="h-8 w-8 p-0"
					>
						<UploadIcon className="h-4 w-4" />
					</Button>
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
							<DropdownMenuItem>View</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => void navigator.clipboard.writeText(upload.id)}
							>
								Copy link
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Rename</DropdownMenuItem>
							<DropdownMenuItem>Delete</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];
