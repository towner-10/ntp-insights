import format from 'date-fns/format';
import { type FormEvent } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';


import { cn } from '@/lib/utils';
import { Scan } from 'database';
import { PropsWithChildren, type ReactNode } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

type PotreeDetailsProps = {
	onShapeChange: (shape: 'circle' | 'square') => void;
	onSizeChange: (size: number[]) => void;
	shape: 'circle' | 'square';
	size: number[];
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

type RendererProperties = {
	/* TODO: Make these properties have defaults */
	shape?: string;
	quality?: number;
	size?: number;
};

export function PotreeDetails(props: PotreeDetailsProps) {
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
		<>
			{/* LiDAR details card */}
			<Card id="lidar-details-card" className="lg:col-span-2">
				<CardHeader>
					<CardTitle>Details</CardTitle>
					<CardDescription>About the current LiDAR view</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col justify-around">
					<div className="grid grid-cols-2">
						<DetailsRow label="Event date">
							<p>Text</p>
						</DetailsRow>
						<DetailsRow label="Event location">
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
						<DetailsRow label="Capture time">
							<p>Text</p>
						</DetailsRow>
						<DetailsRow label="Capture type">
							<p>Text</p>
						</DetailsRow>
					</div>
					<div className="grid grid-cols-2">
						<DetailsRow label="Capture file size">
							<p>Text</p>
						</DetailsRow>
					</div>
				</CardContent>
			</Card>
			
			{/* LiDAR Control Card */}
			<Card id="lidar-controls-card" className="lg:col-span-2 lg: row-span-2">
				<CardHeader>
					<CardTitle>Controls</CardTitle>
					<CardDescription>Change the current LiDAR view</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col justify-around">
					<div className="grid grid-cols-2">
						<DetailsRow label="Point shape">
							<RadioGroup 
								className="pt-2" 
								defaultChecked 
								value={props.shape}
								defaultValue="square"
								onValueChange={props.onShapeChange}
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="square" id="square" />
									<Label className="font-normal text-md" htmlFor="square">Square</Label>
								</div>
								<div className="flex items-center space-x-2 ">
									<RadioGroupItem value="circle" id="circle" />
									<Label className="font-normal text-md" htmlFor="circle">Circle</Label>
								</div>
							</RadioGroup>
						</DetailsRow>
					</div>
					<DetailsRow label="Point cloud size"/>
					<div className="flex items-center space-x-2">
						<Slider
							id="point-cloud-size-slider"
							min={0}
							max={5}
							step={1}
							value={props.size}
							onValueChange={props.onSizeChange}
						/>
						<Label htmlFor="point-cloud-size-slider" className="font-normal text-sm text-align">{props.size}</Label>
					</div>
				</CardContent>
			</Card>
		</>
	);
}
