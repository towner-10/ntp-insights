import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Post } from 'database';
import { LucideForward, LucideHeart, LucideMessageCircle } from 'lucide-react';
import Link from 'next/link';

export const columns: ColumnDef<Post>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
		cell({ row }) {
			return row.original.id;
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
		header: 'Relevance Score',
		cell({ row }) {
			// Determine the highest classification score
			const relevant = row.original.classifications?.['RELEVANT']?.confidence;
			const irrelevant = row.original.classifications?.['IRRELEVANT']?.confidence;

            if (!relevant || !irrelevant) {
                return 'N/A';
            }

			if (relevant > irrelevant) {
				return <p className='text-success'>
                    {`${(relevant * 100).toFixed(0)}% relevant`}
                </p>;
			} else {
				return <p className='text-muted-foreground'>
                    {`${(irrelevant * 100).toFixed(0)}% irrelevant`}
                </p>;
			}
		},
	},
	{
		id: 'view',
		cell({ row }) {
			return (
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="link">View</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Post Details</DialogTitle>
							<DialogDescription>Information about the post.</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col space-y-2">
							{row.original.images[0] && (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									width={500}
									height={500}
									src={row.original.images[0].replace('https://', '/')}
									alt="Post Image"
									className="max-h-[500px] w-full object-contain"
								/>
							)}
							{row.original.videos[0] && (
								<video
									src={row.original.videos[0]}
									controls
									className="max-h-[500px] w-full"
								/>
							)}
							<p className="py-4">{row.original.content}</p>
							<div className="flex flex-row items-center justify-between">
								<div className="flex flex-row items-center justify-between gap-4">
									<div className="flex flex-row gap-2">
										<LucideHeart />
										<b>{row.original.likes}</b>
									</div>
									<div className="flex flex-row gap-2">
										<LucideMessageCircle />
										<b>{row.original.comments}</b>
									</div>
									<div className="flex flex-row gap-2">
										<LucideForward />
										<b>{row.original.shares}</b>
									</div>
								</div>
								<Link href={row.original.url} target="_blank">
									<Button variant="secondary">
										View on{' '}
										{row.original.source_type.charAt(0).toUpperCase() +
											row.original.source_type.slice(1).toLowerCase()}
									</Button>
								</Link>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			);
		},
	},
];
