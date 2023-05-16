import { type ReactNode } from 'react';
import AuthButton from './buttons/auth-button';
import ThemeSwitch from './buttons/theme-switch';
import { Separator } from './ui/separator';

type Props = {
	title?: ReactNode;
};

export default function Header(props: Props) {
	return (
		<nav className="flex flex-wrap sticky w-full px-6 pt-6 z-40 top-0 items-center justify-between bg-background/50 backdrop-blur gap-4 ">
			<div className="flex items-center mr-6">
				<span className="font-bold text-2xl sm:text-4xl">
					{props.title}
				</span>
			</div>
			<div className="flex-grow flex w-auto items-center">
				<div className="text-sm flex-grow"></div>
				<div className='flex flex-row items-center gap-4'>
                    <AuthButton />
					<ThemeSwitch />
				</div>
			</div>
			<Separator />
		</nav>
	);
}
