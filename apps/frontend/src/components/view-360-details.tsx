import format from 'date-fns/format';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { cn } from '@/lib/utils';
import { Image360, Path } from 'database';
import { PropsWithChildren, type ReactNode } from 'react';

type View360DetailsProps = {
	index: number;
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
	return (
		<Card className={cn('lg:col-span-2 lg:row-span-2', props.className)}>
			<CardHeader>
				<CardTitle>Details</CardTitle>
				<CardDescription>About the current 360 view.</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col justify-around">
				<div className="grid grid-cols-2">
					<DetailsRow label="Event occurred on">
						<p>{format(props.path.date, 'MMMM d, yyyy')}</p>
					</DetailsRow>
					<DetailsRow label="Capture taken on">
						<p>
							{(() => {
								try {
									return format(
										props.imageType === 'after'
											? props.path.date
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
						label="Located at"
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
						<DetailsRow label="Previous location at">
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
				<CardDescription>Panorama capture</CardDescription>
				<p>{`${+props.index + +1} / ${
					props.sortedImages.length || props.index + 1
				}`}</p>
			</CardContent>
		</Card>
	);
}
