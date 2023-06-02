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
import { ArrowUpDown, MoreHorizontal, Link2Icon } from 'lucide-react';
import { parse, format } from 'date-fns';

export type Path = {
	id: string;
	name: string;
	author: string;
	date: Date;
};

export const paths: Path[] = [
	{
		id: '1',
		name: 'NTP 2023 Storm Event',
		author: 'Tornado Man',
		date: parse('05-29-2023', 'MM-dd-yyyy', new Date()),
	},
	{
		id: '2',
		name: 'London 2022 Derecho',
		author: 'Kevin Manka',
		date: parse('05-18-2022', 'MM-dd-yyyy', new Date()),
	},
	{
		id: '3',
		name: 'Barrie 2021 Tornado',
		author: 'Collin Town',
		date: parse('07-17-2021', 'MM-dd-yyyy', new Date()),
	},
];

export const columns: ColumnDef<Path>[] = [
	{
		accessorKey: 'name',
		// header: 'Name',
		header: () => {
			return (
				<div className="text-left">
					{'Name'}
				</div>
			)
		}
	},
	{
		accessorKey: 'author',
		// header: 'Created by',
		header: () => {
			return (
				<div className="text-center">
					{'Created by'}
				</div>
			)
		},
		cell: ({ row }) => {
			const author = row.original;
			return(<div className='text-center'>{author.author}</div>)
		}
	},
	{
		accessorKey: 'date',
		header: ({ column }) => {
			return (
				<div className="text-center">
				<Button
					variant="ghost"
					className="text-left"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					{'Date created'}
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
				</div>
			);
		},
		cell: ({ row }) => {
			const upload = row.original;

			return <div className='text-center'><span>{format(upload.date, 'MMMM d, yyyy')}</span></div>;
		},
	},
	{
		id: 'actions',
		// header: 'Actions',
		header: () => {
			return (
				<div className="text-center">
					{'Actions'}
				</div>
			)
		},
		cell: ({ row }) => {
			const upload = row.original;

			return (
				<div className='text-center'>
					<Button
						onClick={() => void navigator.clipboard.writeText(upload.id)}
						variant="ghost"
						className="h-8 w-8 p-0"
					>
						<Link2Icon className="h-4 w-4"/>
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
