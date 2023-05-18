import { signIn, signOut } from 'next-auth/react';
import { Button } from '../ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
	LucideHome,
	LucideLogOut,
	LucidePackagePlus,
	LucideSettings,
	LucideUser,
	LucideX,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { type Session } from 'next-auth';
import { Badge } from '../ui/badge';

type Props = {
	session: Session;
};

export default function AuthButton(props: Props) {
	const router = useRouter();
	const sessionData = props.session;

	const handleSignOut = async () => {
		await signOut();
		await router.push('/');
	}

	if (sessionData?.user) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Avatar className="hover:cursor-pointer">
						<AvatarImage
							src={sessionData.user.image || ''}
							alt={sessionData.user.email || ''}
						/>
						<AvatarFallback>
							<LucideUser />
						</AvatarFallback>
					</Avatar>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>
						<div className="flex flex-col space-y-1">
							<p className="font-medium">{sessionData.user.name}</p>
							<p className="text-xs text-muted-foreground">
								{sessionData.user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{sessionData.user.ntpAuthenticated ? (<DropdownMenuItem
						onClick={() => {
							void router.push('/search/new');
						}}
					>
						<LucidePackagePlus size={18} />
						<span className="pl-2">New Search</span>
					</DropdownMenuItem>) : (
						<DropdownMenuLabel>
							<div className="flex flex-row items-center justify-between">
								<p className="text-xs text-muted-foreground">
									Not NTP authenticated
								</p>
								<Badge variant="destructive"><LucideX /></Badge>
							</div>
						</DropdownMenuLabel>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => {
							void router.push('/');
						}}
					>
						<LucideHome size={18} />
						<span className="pl-2">Home</span>
					</DropdownMenuItem>
					<DropdownMenuGroup>
						<DropdownMenuItem
							onClick={() => {
								void router.push('/auth/profile');
							}}
						>
							<LucideUser size={18} />
							<span className="pl-2">Profile</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => {
								void router.push('/auth/profile/settings');
							}}
						>
							<LucideSettings size={18} />
							<span className="pl-2">Settings</span>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => void handleSignOut()}>
							<LucideLogOut size={18} />
							<span className="pl-2">Sign Out</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return <Button onClick={() => void signIn()}>Sign in</Button>;
}
