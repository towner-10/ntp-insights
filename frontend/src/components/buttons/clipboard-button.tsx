import { type PropsWithChildren } from 'react';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';

type ClipboardButtonProps = {
	text: string;
	notify?: boolean;
};

export default function ClipboardButton(
	props: PropsWithChildren<ClipboardButtonProps>
) {
	const toaster = useToast();

	return (
		<Button
			onClick={() => {
				void navigator.clipboard.writeText(props.text);
				props.notify &&
					toaster.toast({
						title: 'Copied to clipboard',
						description: `Copied "${props.text}" to clipboard`,
						duration: 2000,
					});
			}}
			variant="ghost"
			className="h-8 w-8 p-0"
		>
			{props.children}
		</Button>
	);
}
