import { Label } from '@/components/ui/label';

export const DialogContentHeader = (props: {
	index: number;
	title: React.ReactNode;
	description: React.ReactNode;
}) => {
	return (
		<div className="flex w-full flex-col md:w-96 lg:w-[500px]">
			<Label htmlFor="event-name" className="pb-2">
				<div className="flex flex-row gap-5">
					<span>{props.index}</span>
					<span>{props.title}</span>
				</div>
			</Label>
			<p className="pt-1 text-xs text-muted-foreground">{props.description}</p>
		</div>
	);
};
