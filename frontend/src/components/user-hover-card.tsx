import dayjs from 'dayjs';
import { api } from '@/utils/api';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
	CalendarDays,
	LucidePackagePlus,
	LucideRotate3d,
	LucideUser,
} from 'lucide-react';
import { Badge } from './ui/badge';

export const UserHoverCard = ({ id }: { id: string }) => {
	const user = api.users.getUser.useQuery({
		id: id,
	});

	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<a className="cursor-pointer underline-offset-2 hover:underline">
					{user.data?.name}
				</a>
			</HoverCardTrigger>
			<HoverCardContent className="max-w-80 w-auto">
				<div className="flex space-x-4 items-center pb-2">
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
					</div>
				</div>
				<div className="flex items-center pt-2">
					<CalendarDays className="mr-2 h-4 w-4 opacity-70" />{' '}
					<span className="text-xs text-muted-foreground">
						Joined {dayjs(user.data?.createdAt).format('MMMM YYYY')}
					</span>
				</div>
				<div className="flex items-center pt-2">
					<LucidePackagePlus className="mr-2 h-4 w-4 opacity-70" />{' '}
					<span className="text-xs text-muted-foreground">
						<b>{user.data?._count.searches_created}</b>{' '}
						{user.data?._count.searches_created === 1 ? 'search' : 'searches'}{' '}
						created
					</span>
				</div>
				<div className="flex items-center pt-2">
					<LucideRotate3d className="mr-2 h-4 w-4 opacity-70" />{' '}
					<span className="text-xs text-muted-foreground">
						<b>3</b> tours created
					</span>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
};
