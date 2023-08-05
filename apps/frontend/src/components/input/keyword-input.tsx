import { type FocusEventHandler, useState } from 'react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { LucideXCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type KeywordInputProps = {
	value: string[];
	onChange: (value: string[]) => void;
	onBlur?: FocusEventHandler<HTMLInputElement>;
	inputRef?: React.Ref<HTMLInputElement>;
	lockedKeywords?: string[];
	disabled?: boolean;
	className?: string;
};

export function KeywordInput(props: KeywordInputProps) {
	const [value, setValue] = useState<string[]>(props.value);
	const [input, setInput] = useState<string>('');

	const setKeywords = (keywords: string[]) => {
		props.onChange(keywords);
		setValue(keywords);
	};

	return (
		<div
			className={cn('bg-card text-card-foreground', props.className)}
		>
			{(props.value.length > 0 || props.lockedKeywords) && (
				<div className="bg-card mb-2 flex flex-row flex-wrap gap-2 rounded-md border p-2">
					{props.lockedKeywords?.map((keyword, index) => {
						return (
							<Badge key={index} variant="secondary">
								<div className="flex flex-row items-center gap-1 overflow-ellipsis">
									<p>{keyword}</p>
								</div>
							</Badge>
						);
					})}
					{props.value.map((keyword, index) => {
						return (
							<Badge
								key={index}
								onClick={() =>
									setKeywords(value.filter((value) => value !== keyword))
								}
							>
								<div className="flex flex-row items-center gap-1 overflow-ellipsis hover:cursor-pointer">
									<p>{keyword}</p>
									<LucideXCircle size={14} />
								</div>
							</Badge>
						);
					})}
				</div>
			)}
			<Input
				type="text"
				placeholder="Enter a keyword..."
				className="w-full"
				ref={props.inputRef}
				value={input}
				onBlur={props.onBlur}
				onChange={(e) => setInput(e.target.value)}
				disabled={props.disabled}
				onKeyDown={(e) => {
					const trimmedInput = input.trim();

					if (e.key === ',' || e.key === 'Enter') {
						e.preventDefault();

						if (trimmedInput.length && !value.includes(trimmedInput)) {
							setInput('');
							setKeywords([...value, trimmedInput]);
						}
					}
				}}
			/>
		</div>
	);
}
