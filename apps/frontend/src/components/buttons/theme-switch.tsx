import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LucideMoon, LucideSun } from 'lucide-react';

const ThemeSwitch = () => {
	const [mounted, setMounted] = useState(false);
	const { theme, resolvedTheme, setTheme } = useTheme();
	const { toast } = useToast();

	// useEffect only runs on the client, so now we can safely show the UI
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon">
					{resolvedTheme === 'dark' ? <LucideMoon /> : <LucideSun />}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>Change Theme</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup
					value={theme}
					onValueChange={(value) => {
						toast({
							title: 'Theme changed',
							description: (
								<p>
									Changed to <b>{value}</b>.
								</p>
							),
							duration: 2000,
						});
						setTheme(value);
					}}
				>
					<DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ThemeSwitch;
