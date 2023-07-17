import format from 'date-fns/format';
import { type FormEvent } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Button } from '@/components/ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Image360, Path } from 'database';
import { PropsWithChildren, type ReactNode } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { CornerDownLeft } from 'lucide-react';

type View360DetailsProps = {
	index: number;
	onIndexChange: (value: number) => void;
	imageType: 'before' | 'after';
	className?: string;
	path: Path;
	sortedImages: (Image360 & {
		before: Image360;
	})[];
};

function DetailsRow(
	props: PropsWithChildren<{ label: string; className?: string }>
) {
	return (
		<div className={cn('flex flex-row pb-4', props.className)}>
			<div className="flex flex-col">
				<p className="text-muted-foreground text-sm">{props.label}</p>
				{props.children}
			</div>
		</div>
	);
}

export function View360Details(props: View360DetailsProps) {
	type Inputs = {
		pano: string;
	};

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<Inputs>();

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void (async () => {
			await handleSubmit(((data) => {
				props.onIndexChange(Number(data.pano) - 1);
				reset();
			}) as SubmitHandler<Inputs>)(event);
		})();
	};

	return (
		<Card className={cn('lg:col-span-2 lg:row-span-2', props.className)}>
			<CardHeader>
				<CardTitle>Details</CardTitle>
				<CardDescription>About the current 360 view</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col justify-around">
				<div className="grid grid-cols-2">
					<DetailsRow label="Event date">
						<p>{format(props.path.date, 'MMMM d, yyyy')}</p>
					</DetailsRow>
					<DetailsRow label="Capture date">
						<p>
							{(() => {
								try {
									return format(
										props.imageType === 'after'
											? props.sortedImages?.[props.index].date_taken
											: props.sortedImages?.[props.index].before.date_taken,
										'MMMM d, yyyy'
									);
								} catch (err) {
									return 'N/A';
								}
							})()}
						</p>
					</DetailsRow>
				</div>
				<div className="grid grid-cols-2">
					<DetailsRow
						label="Location"
						className={!props.sortedImages?.[props.index - 1] && 'col-span-2'}
					>
						<p>
							{props.imageType === 'after'
								? props.sortedImages?.[props.index]?.lng
								: props.sortedImages?.[props.index]?.before.lng}
							,{' '}
							{props.imageType === 'after'
								? props.sortedImages?.[props.index]?.lat
								: props.sortedImages?.[props.index]?.before.lat}
						</p>
					</DetailsRow>
					{props.sortedImages?.[props.index - 1] && (
						<DetailsRow label="Previous location">
							<p>
								{props.imageType === 'after'
									? props.sortedImages?.[props.index - 1]?.lng
									: props.sortedImages?.[props.index - 1]?.before.lng}
								,{' '}
								{props.imageType === 'after'
									? props.sortedImages?.[props.index - 1]?.lat
									: props.sortedImages?.[props.index - 1]?.before.lat}
							</p>
						</DetailsRow>
					)}
				</div>
				<div className="grid grid-cols-2">
					<DetailsRow label="Elevation">
						<p>
							{props.imageType === 'after'
								? `${props.sortedImages?.[props.index]?.altitude.toFixed(1)} m`
								: props.sortedImages?.[props.index]?.before.altitude != null
									? `${props.sortedImages?.[props.index]?.before.altitude.toFixed(
										1
									)} m`
									: 'N/A'}
						</p>
					</DetailsRow>
					<DetailsRow label="Image size">
						<p>
							{props.imageType === 'after'
								? `${props.sortedImages?.[props.index]?.image_size / BigInt(1024)} kB`
								: `${props.sortedImages?.[props.index]?.before.image_size / BigInt(1024)} kB`}
						</p>
					</DetailsRow>
				</div>
				<form onSubmit={onSubmit}>
					<CardDescription>Panorama capture</CardDescription>
					<div className='flex flex-row items-center py-1'>
						<Input
							className='w-12 h-8 p-0.5 mr-2 text-center text-base'
							type="string"
							{...register('pano', { required: true, max: props.sortedImages.length, min: 1 })}
							placeholder={String(props.index + 1)}
						/>
						{`/ ${props.sortedImages.length || props.index + 1
							}`}
						<span className="px-4">
							<Button variant="secondary" type="submit" className="h-8 w-8 p-0.5" disabled={errors.pano !== undefined}>
								<CornerDownLeft className="h-4" />
							</Button>
						</span>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
