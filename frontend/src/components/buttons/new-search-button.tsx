import { LucidePackagePlus } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/router';

export function NewSearchButton() {
	const router = useRouter();

	return (
		<Button onClick={() => void router.push('/social/new')}>
			<LucidePackagePlus className="pr-2" />
			New Search
		</Button>
	);
}
