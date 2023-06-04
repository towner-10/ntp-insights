import {
	TableCaption,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
	Table,
} from './ui/table';
import { Button } from './ui/button';
import { api } from '@/utils/api';
import { Skeleton } from './ui/skeleton';
import { UserHoverCard } from './user-hover-card';

export function AuthenticateUsersTable() {
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

	if (users.isLoading) {
		return (
			<Table>
				<TableCaption>
					List of all non-authenticated users. Click on a user to authenticate.
				</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>Email</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>
							<Skeleton className="h-10" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-10" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-10" />
						</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>
							<Skeleton className="h-10" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-10" />
						</TableCell>
						<TableCell>
							<Skeleton className="h-10" />
						</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		);
	}

	if (!users.data?.pages[0]?.users.length) {
		return (
			<h2 className="text-center font-semibold text-muted-foreground">
				No users to authenticate right now.
			</h2>
		);
	}

	return (
		<Table>
			<TableCaption>
				List of all non-authenticated users. Click on a user to authenticate.
			</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Email</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.data?.pages.map((page) =>
					page.users.map((user) => (
						<TableRow key={user.id}>
							<TableCell>{user.email}</TableCell>
							<TableCell>
								<UserHoverCard id={user.id} />
							</TableCell>
							<TableCell>
								<Button
									onClick={() => void handleAuthenticate(user.id)}
									disabled={authenticate.isLoading}
								>
									Authenticate
								</Button>
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}
