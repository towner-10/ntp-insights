import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	SortingState,
	getSortedRowModel,
} from '@tanstack/react-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { LucideFlag, LucideFlagOff } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	onFlag: (indices: number[], flag: boolean) => void;
	className?: string;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	onFlag,
	className,
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = useState({});
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: 'classifications',
			desc: false,
		},
	]);
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			rowSelection,
		},
	});

	return (
		<div className={cn(className)}>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex flex-grow items-center justify-start">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='outline'
								size='sm'
								disabled={!table.getFilteredSelectedRowModel().rows.length}
							>
								Edit ({table.getFilteredSelectedRowModel().rows.length}{' '}
								posts)
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem
								onClick={() => {
									onFlag(
										table
											.getFilteredSelectedRowModel()
											.rows.map((row) => row.index),
										true
									);

									table.getFilteredSelectedRowModel().rows.forEach((row) => {
										row.toggleSelected(false);
									});
								}}
							>
								<LucideFlag className="mr-2 h-4 w-4" /> Flag
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									onFlag(
										table
											.getFilteredSelectedRowModel()
											.rows.map((row) => row.index),
										false
									);

									table.getFilteredSelectedRowModel().rows.forEach((row) => {
										row.toggleSelected(false);
									});
								}}
							>
								<LucideFlagOff className="mr-2 h-4 w-4" /> Unflag
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<p className="text-muted-foreground mx-4">
					Page{' '}
					<strong>
						{table.getState().pagination.pageIndex + 1} of{' '}
						{table.getPageCount()}
					</strong>
				</p>
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						table.previousPage();
					}}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
