import { type ReactNode, type PropsWithChildren } from 'react';
import { useToast } from '../ui/use-toast';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '../ui/tooltip';

type ClipboardButtonProps = {
	text: string;
	tooltip?: ReactNode;
	notify?: boolean;
};

export default function ClipboardButton(
	props: PropsWithChildren<ClipboardButtonProps>
) {
	const toaster = useToast();

	return (
		<TooltipProvider>
			<Tooltip disableHoverableContent={props.tooltip === undefined}>
				<TooltipTrigger asChild>
					<a
						onClick={() => {
							void navigator.clipboard.writeText(props.text);
							props.notify &&
								toaster.toast({
									title: 'Copied to clipboard',
									duration: 2000,
								});
						}}
					>
						{props.children}
					</a>
				</TooltipTrigger>
				<TooltipContent className={`${props.tooltip ? '' : 'hidden'}`}>
					{props.tooltip || 'Copy to clipboard'}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
