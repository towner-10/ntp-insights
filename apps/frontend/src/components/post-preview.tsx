import { Post } from 'database';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { PostDialog } from './dialogs/post-dialog';

export function PostPreview(props: { index: number; post: Post }) {
	return (
		<Card className="max-w-sm">
			<CardHeader>
				<CardTitle>Post #{props.index + 1}</CardTitle>
				<CardDescription>
					{(props.post.classifications?.['RELEVANT']?.confidence * 100).toFixed(
						2
					)}
					% relevant
				</CardDescription>
			</CardHeader>
			<CardContent>
				{props.post.images[0] && !props.post.videos[0] && (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={props.post.images[0]}
						alt="Post image"
						className="h-64 w-full object-cover"
					/>
				)}
				{props.post.videos[0] && (
					<video
						src={props.post.videos[0]}
						controls
						className="h-64 w-full object-cover"
					/>
				)}
				<p className="truncate py-4">
					{props.post.content.replace('\n', ' ').replace(/\s\s+/g, ' ')}
				</p>
			</CardContent>
			<CardFooter className="flex flex-row justify-end gap-4">
				<PostDialog post={props.post} />
			</CardFooter>
		</Card>
	);
}
