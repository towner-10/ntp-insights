import { type ReactNode } from 'react';
import AuthButton from './buttons/auth-button';
import ThemeSwitch from './buttons/theme-switch';
import { Separator } from './ui/separator';
import { type Session } from 'next-auth';

type Props = {
	title?: ReactNode;
	session: Session | null;
};

export default function Header(props: Props) {
	return (
		<>
			<nav className="fixed top-0 z-40 flex w-full flex-wrap h-20 items-center justify-between gap-4 bg-background/50 px-6 pt-6 backdrop-blur">
				<div className="mr-6 flex items-center">
					<span className="text-4xl font-bold">{props.title}</span>
				</div>
				<div className="flex w-auto flex-grow items-center">
					<div className="flex-grow text-sm"></div>
					<div className="flex flex-row items-center gap-4">
						{props.session && (
							<AuthButton session={props.session} />
						)}
						<ThemeSwitch />
					</div>
				</div>
				<Separator />
			</nav>
			<div className="h-20" />
		</>
	);
}
