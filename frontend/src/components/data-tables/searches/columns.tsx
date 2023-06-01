import dayjs from 'dayjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card';
import { api } from '@/utils/api';
import { type Search } from '@prisma/client';
import { type ColumnDef } from '@tanstack/react-table';
import { CalendarDays, LucideUser } from 'lucide-react';
import Link from 'next/link';

export const columns: ColumnDef<Search>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		cell({ row }) {
			return (
				<Link href={`/search/${row.original.id}/view`}>
					<Button variant="link">{row.original.name}</Button>
				</Link>
			);
		},
	},
	{
		accessorKey: 'created_by_id',
		header: 'Created By',
		cell({ row }) {
			const user = api.users.getUser.useQuery({
				id: row.original.created_by_id,
			});

			return (
				<HoverCard>
					<HoverCardTrigger asChild>
						<a className="cursor-pointer underline-offset-2 hover:underline">{user.data?.name}</a>
					</HoverCardTrigger>
					<HoverCardContent className="max-w-80">
						<div className="flex justify-between space-x-2">
							<Avatar>
								<AvatarImage src={user.data?.image || ''} />
								<AvatarFallback>
									<LucideUser />
								</AvatarFallback>
							</Avatar>
							<div className="space-y-1">
								<h4 className="text-sm font-semibold">{user.data?.name}</h4>
								{user.data?.ntpAuthenticated && (
									<Badge variant="success">NTP Member</Badge>
								)}
								<div className="flex items-center pt-2">
									<CalendarDays className="mr-2 h-4 w-4 opacity-70" />{' '}
									<span className="text-xs text-muted-foreground">
										Joined {dayjs(user.data?.createdAt).format('MMMM YYYY')}
									</span>
								</div>
							</div>
						</div>
					</HoverCardContent>
				</HoverCard>
			);
		},
	},
	{
		accessorKey: 'frequency',
		header: 'Frequency',
		cell({ row }) {
			const frequency = row.original.frequency;

			return `${frequency} min`;
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
];
