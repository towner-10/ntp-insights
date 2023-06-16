import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Search } from '@prisma/client';
import { type ColumnDef } from '@tanstack/react-table';
import { UserHoverCard } from '@/components/user-hover-card';

export const columns: ColumnDef<Search>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		cell({ row }) {
			return (
				<Link href={`/social/${row.original.id}/view`}>
					<Button variant="link">{row.original.name}</Button>
				</Link>
			);
		},
	},
	{
		accessorKey: 'created_by_id',
		header: 'Created By',
		cell({ row }) {
			return (
				<UserHoverCard id={row.original.created_by_id} />
			);
		},
	},
	{
		accessorKey: 'frequency',
		header: 'Frequency',
		cell({ row }) {
			const frequency = row.original.frequency;

			return `${frequency} hours`;
		},
	},
	{
		accessorKey: 'keywords',
		header: 'Keywords',
		cell({ row }) {
			const keywords = row.original.keywords;

			return (
				<div className="flex max-w-md flex-wrap gap-1">
					{keywords.map((keyword) => (
						<Badge key={keyword} variant="secondary">
							{keyword}
						</Badge>
					))}
				</div>
			);
		},
	},
	{
		accessorKey: 'twitter',
		header: 'Twitter',
		cell({ row }) {
			const twitter = row.original.twitter;

			return (
				<Badge variant={twitter ? 'default' : 'secondary'}>
					{twitter ? 'Yes' : 'No'}
				</Badge>
			);
		},
	},
	{
		accessorKey: 'facebook',
		header: 'Facebook',
		cell({ row }) {
			const facebook = row.original.facebook;

			return (
				<Badge variant={facebook ? 'default' : 'secondary'}>
					{facebook ? 'Yes' : 'No'}
				</Badge>
			);
		},
	},
	{
		accessorKey: 'enabled',
		header: 'Enabled',
		cell({ row }) {
			const enabled = row.original.enabled;

			return (
				<Badge variant={enabled ? 'default' : 'destructive'}>
					{enabled ? 'Yes' : 'No'}
				</Badge>
			);
		}
	}
];
