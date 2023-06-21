import { PostFlagged } from '@/components/buttons/post-flagged';
import { PostDialog } from '@/components/dialogs/post-dialog';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { Post } from 'database';
import { ArrowUpDown } from 'lucide-react';

export const columns: ColumnDef<Post>[] = [
	{
		id: 'content',
		header: 'Content',
		cell({ row }) {
			// Remove new lines and replace multiple spaces in a row with just one and cut off the string at 100 characters
			return (
				<p className="max-w-md truncate">
					{row.original.content.replace('\n', ' ').replace(/\s\s+/g, ' ')}
				</p>
			);
		},
	},
	{
		accessorKey: 'created_at',
		header: 'Created At',
		cell({ row }) {
			return new Date(row.original.created_at).toLocaleString('en-US', {
				month: 'short',
				day: '2-digit',
				hour: 'numeric',
				minute: 'numeric',
			});
		},
	},
	{
		accessorKey: 'classifications',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Relevance
					<ArrowUpDown className="ml-2 h-4 w-4" />
				</Button>
			);
		},
		sortingFn: (a, b) => {
			// Sort based on the highest classification score
			const aRelevant = a.original.classifications?.['RELEVANT']?.confidence;
			const bRelevant = b.original.classifications?.['RELEVANT']?.confidence;

			if (!aRelevant || !bRelevant) {
				return 0;
			}

			return bRelevant - aRelevant;
		},
		cell({ row }) {
			// Determine the highest classification score
			const relevant = row.original.classifications?.['RELEVANT']?.confidence;
			const irrelevant =
				row.original.classifications?.['IRRELEVANT']?.confidence;

			if (!relevant || !irrelevant) {
				return 'N/A';
			}

			if (relevant > irrelevant) {
				return (
					<p className="text-success">
						{`${(relevant * 100).toFixed(0)}% relevant`}
					</p>
				);
			} else {
				return (
					<p className="text-muted-foreground">
						{`${(irrelevant * 100).toFixed(0)}% irrelevant`}
					</p>
				);
			}
		},
	},
	{
		id: 'flag',
		header: 'Flagged',
		cell({ row }) {
			return <PostFlagged post={row.original} />;
		},
	},
	{
		id: 'view',
		cell({ row }) {
			return <PostDialog post={row.original} />;
		},
	},
];
