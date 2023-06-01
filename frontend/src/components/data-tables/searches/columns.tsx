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
import dayjs from 'dayjs';
import { CalendarDays, LucideUser } from 'lucide-react';

export const columns: ColumnDef<Search>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
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
						<Button variant="link">{user.data?.name}</Button>
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
	},
	{
		accessorKey: 'keywords',
		header: 'Keywords',
	},
	{
		accessorKey: 'twitter',
		header: 'Twitter',
	},
	{
		accessorKey: 'facebook',
		header: 'Facebook',
	},
];
