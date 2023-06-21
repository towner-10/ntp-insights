import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { DialogHeader } from '../ui/dialog';
import { Post } from 'database';
import {
	LucideForward,
	LucideHeart,
	LucideMessageCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

export function PostDialog(props: { post: Post }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Open</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Post Details</DialogTitle>
					<DialogDescription>Information about the post.</DialogDescription>
				</DialogHeader>
				<div className="flex max-h-[750px] flex-col space-y-2 overflow-y-auto">
					{props.post.images[0] && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							width={500}
							height={500}
							src={props.post.images[0].replace('https://', '/')}
							alt="Post Image"
							className="max-h-[500px] w-full object-contain"
						/>
					)}
					{props.post.videos[0] && (
						<video
							src={props.post.videos[0]}
							controls
							className="max-h-[500px] w-full"
						/>
					)}
					<p className="py-4">{props.post.content}</p>
					<div className="flex flex-row items-center justify-between">
						<div className="flex flex-row items-center justify-between gap-4">
							<div className="flex flex-row gap-2">
								<LucideHeart />
								<b>{props.post.likes}</b>
							</div>
							<div className="flex flex-row gap-2">
								<LucideMessageCircle />
								<b>{props.post.comments}</b>
							</div>
							<div className="flex flex-row gap-2">
								<LucideForward />
								<b>{props.post.shares}</b>
							</div>
						</div>
						<Link href={props.post.url} target="_blank">
							<Button variant="secondary">
								View on{' '}
								{props.post.source_type.charAt(0).toUpperCase() +
									props.post.source_type.slice(1).toLowerCase()}
							</Button>
						</Link>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
