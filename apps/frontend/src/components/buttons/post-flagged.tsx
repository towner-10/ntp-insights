import { Post } from 'database';
import { Button } from '../ui/button';
import { LucideFlag, LucideFlagOff } from 'lucide-react';
import { api } from '@/utils/api';
import { useState } from 'react';

export function PostFlagged(props: { post: Post }) {
	const setFlagged = api.posts.setFlagged.useMutation();
	const [flagged, setFlaggedState] = useState(props.post.flagged);

	return (
		<Button
			variant={flagged ? 'default' : 'secondary'}
			onClick={() => {
				setFlagged.mutate(
					{
						id: props.post.id,
						flagged: !props.post.flagged,
					},
					{
						onSuccess: () => {
							setFlaggedState(!flagged);
						},
					}
				);
			}}
		>
			{flagged ? <LucideFlag /> : <LucideFlagOff />}
		</Button>
	);
}
