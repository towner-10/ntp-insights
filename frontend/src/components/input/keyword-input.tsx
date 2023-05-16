import { type FocusEventHandler, useState } from 'react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { LucideXCircle } from 'lucide-react';

type KeywordInputProps = {
	value: string[];
	onChange: (value: string[]) => void;
	onBlur: FocusEventHandler<HTMLInputElement>;
	inputRef: React.Ref<HTMLInputElement>;
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
			className={`rounded-lg border bg-card text-card-foreground shadow-sm ${
				props.value.length > 0 ? 'p-2' : ''
			}`}
		>
			{props.value.length > 0 && (
				<div className="flex flex-row flex-wrap gap-2 pb-2">
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
				id="keywords"
				type="text"
				placeholder="Enter a keyword..."
				className="w-full"
				ref={props.inputRef}
				value={input}
				onBlur={props.onBlur}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => {
					const trimmedInput = input.trim();

					if (e.key === ',') {
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
