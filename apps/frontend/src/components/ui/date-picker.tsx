import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

type DatePickerProps = {
	id: string;
	className?: string;
	value?: Date | undefined;
	onChange?: (...event: unknown[]) => void;
};

export function DatePicker(props: DatePickerProps) {
	const [date, setDate] = React.useState<Date | undefined>(props.value);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={'outline'}
					className={cn(
						'w-[280px] justify-start text-left font-normal',
						!date && 'text-muted-foreground',
						props.className
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{date ? format(date, 'PPP') : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Calendar
					id={props.id}
					mode="single"
					selected={props.value}
					onSelect={(e) => {
						setDate(e);

						if (props.onChange) props.onChange(e);
					}}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
