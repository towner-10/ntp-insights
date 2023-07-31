import format from 'date-fns/format';
import { type FormEvent } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';

import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Image360, Path } from 'database';
import { PropsWithChildren, type ReactNode } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { CornerDownLeft } from 'lucide-react';
import { radToDeg } from 'three/src/math/MathUtils';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

type LiDARDetailsProps = {
	// index: number;
	// onIndexChange: (value: number) => void;
	// imageType: 'before' | 'after';
	// className?: string;
	// path: Path;
	// sortedImages: (Image360 & {
	// 	before: Image360;
	// })[];
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

export function LiDARDetails(props: LiDARDetailsProps) {
	type RendererProperties = {
        /* TODO: Make these properties have defaults */
		shape?: string;
        quality?: number;
        size?: number;
	};

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<RendererProperties>();

	// const onSubmit = (event: FormEvent<HTMLFormElement>) => {
	// 	event.preventDefault();
	// 	void (async () => {
	// 		await handleSubmit(((data) => {
	// 			props.onIndexChange(Number(data.pano) - 1);
	// 			reset();
	// 		}) as SubmitHandler<RendererProperties>)(event);
	// 	})();
	// };

	return (
		// <Card className={cn('lg:col-span-2 lg:row-span-2', props.className)}>
        <Card className="lg:col-span-2 lg: row-span-2">
			<CardHeader>
				<CardTitle>Details</CardTitle>
				<CardDescription>About the current LiDAR view</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col justify-around">
				<div className="grid grid-cols-2">
					<DetailsRow label="Event date">
						<p>Text</p>
					</DetailsRow>
					<DetailsRow label="Capture date">
						<p>
							{/* {(() => {
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
							})()} */}
                            Text
						</p>
					</DetailsRow>
                    
				</div>
				<div className="grid grid-cols-2">
					{/* Here once lies the coordinates row */}
				</div>
				<div className="grid grid-cols-2">
					{/* Here once lies the elevation details */}
					<DetailsRow label="File size">
						<p>
							{/* {props.imageType === 'after'
								? `${props.sortedImages?.[props.index]?.image_size / BigInt(1024)} kB`
								: `${props.sortedImages?.[props.index]?.before.image_size / BigInt(1024)} kB`} */}
                                Text
						</p>
					</DetailsRow>
				</div>
                <DetailsRow label="Point cloud size"/>
                <span className="pb-6"><Slider/></span>
			</CardContent>
		</Card>
	);
}
