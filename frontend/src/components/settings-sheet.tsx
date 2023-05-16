import { type ReactNode } from 'react';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet';
import { useSession } from 'next-auth/react';
import { Separator } from './ui/separator';
import { api } from '@/utils/api';
import { Button } from './ui/button';
import { LucideArrowRight } from 'lucide-react';

type SettingsSheetProps = {
	trigger: ReactNode;
};

export function SettingsSheet(props: SettingsSheetProps) {
	const session = useSession();
	const users = api.users.getAllUnauthenticated.useInfiniteQuery(
		{
			limit: 10,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);
	const authenticate = api.users.authenticate.useMutation();

	const handleAuthenticate = async (userId: string) => {
		const response = await authenticate.mutateAsync({
			id: userId,
		});

		if (response.ntpAuthenticated) {
			await users.refetch();
		}
	};

	return (
		<Sheet>
			<SheetTrigger asChild>{props.trigger}</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Settings</SheetTitle>
					<SheetDescription>Your account settings.</SheetDescription>
				</SheetHeader>
				<div className="inline-grid grid-cols-2 items-center gap-4 pt-4">
					<p className="font-medium">Name</p>
					<p className="text-xs text-muted-foreground">
						{session.data?.user?.name}
					</p>
					<Separator className="col-span-2" />
					<p className="font-medium">Email</p>
					<p className="text-xs text-muted-foreground">
						{session.data?.user?.email}
					</p>
					<Separator className="col-span-2" />
					<p className="font-medium">NTP Authenticated</p>
					<p className="text-xs text-muted-foreground">
						{session.data?.user?.ntpAuthenticated ? 'Yes' : 'No'}
					</p>
					{users.data?.pages[0]?.users.length === 0 ? (
						<>
							<Separator className="col-span-2" />
							<p className="text-xs text-muted-foreground">
								No users to authenticate.
							</p>
						</>
					) : (
						<>
							<Separator className="col-span-2" />
							<div className="col-span-2 inline-grid grid-cols-2 items-center gap-4 rounded-lg border p-4">
								<p className="font-medium">Email</p>
								<p className="font-medium">Authenticate</p>
								{users.data?.pages.map((page) =>
									page.users.map((user) => (
										<>
											<p>{user.email}</p>
											<Button onClick={() => void handleAuthenticate(user.id)}>
												Authenticate
											</Button>
										</>
									))
								)}
								{users.hasNextPage && (
									<>
										<Separator className="col-span-2" />
										<Button onClick={() => void users.fetchNextPage()}>
											<LucideArrowRight />
											Load More
										</Button>
									</>
								)}
							</div>
						</>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
