//@ts-nocheck
import format from 'date-fns/format';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';

import { cn } from '@/lib/utils';
import { PropsWithChildren, type ReactNode } from 'react';
import { Slider } from '@/components/ui/slider';
//import { RadioGroup, RadioGroupItem } from './ui/radio-group'; // Unused for now
import { Label } from './ui/label';

// Props for potree details card
type PotreeDetailsProps = {
	event_date: number | Date;
	date_taken: number | Date;
	scan_location: string;
	scan_size: bigint; // in bytes
	scan_type: string;
};

// Props for potree controls card
type PotreeControlsProps = {
	//shape: 'circle' | 'square';
	//onShapeChange: (shape: 'circle' | 'square') => void;

	count: number[];
	onCountChange: (count: number[]) => void;

	size: number[];
	onSizeChange: (size: number[]) => void;
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

// Size slider for potree controls card
function SizeSlider(props: PotreeControlsProps) {
	const sliderDefault = (
		<>
			<Slider
				id="point-size-slider"
				min={0}
				max={400}
				step={1}
				value={props.size}
				onValueChange={props.onSizeChange}
			/>
			
			<Label htmlFor="point-size-slider" className="font-normal text-sm text-align">{props.size}</Label>
			
		</>
	);
	
	viewer.setMinNodeSize(props.size[0]);

	return (
		<div className=" flex items-center space-x-2">
			{sliderDefault}
		</div>
	)	
}

// Point count slider for potree controls card
function CountSlider(props: PotreeControlsProps) {
	const sliderDefault = (
		<>
			<Slider
				id="point-size-slider"
				min={10000}
				max={1000000}
				step={1}
				value={props.count}
				onValueChange={props.onCountChange}
			/>
			
			<Label htmlFor="point-count-slider" className="font-normal text-sm text-align">{props.count}</Label>
			
		</>
	);
	
	viewer.setPointBudget(props.count[0]);

	return (
		<div className=" flex items-center space-x-2">
			{sliderDefault}
		</div>
	)
}

export function PotreeDetails(props: PotreeDetailsProps) {
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
							{(() => {
									try {
										return format(
											props.event_date,
											'MMMM d, yyyy'
										);
									} catch (err) {
										return 'N/A';
									}
								})()}
						</DetailsRow>
						<DetailsRow label="Event location">
							{props.scan_location}
						</DetailsRow>
					</div>
					<div className="grid grid-cols-2">
						<DetailsRow label="Capture date">
							{(() => {
									try {
										return format(
											props.date_taken,
											'MMMM d, yyyy'
										);
									} catch (err) {
										return 'N/A';
									}
								})()}
						</DetailsRow>
						<DetailsRow label="Capture type">
							{props.scan_type}
						</DetailsRow>
					</div>
					<div className="grid grid-cols-2">
						<DetailsRow label="Capture file size">
							<p>
							{`${props.scan_size / BigInt(1048576)} MB`} {/* Conversion from bytes to megabytes */}
							</p>
						</DetailsRow>
					</div>
				</CardContent>
			</Card>
		</>
	)

}

export function PotreeControls(props: PotreeControlsProps) {
	return (
		<>
			{/* LiDAR Control Card */}
			<Card id="lidar-controls-card" className="lg:col-span-2 lg: row-span-2 bg-background/60 backdrop-blur">
				<CardHeader>
					<CardTitle>Controls</CardTitle>
					<CardDescription>Change the current LiDAR view</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col justify-around">
					<div className="grid grid-cols-2">
						<DetailsRow label="Point count"/>
						<CountSlider {...props}/>
						<DetailsRow label="Point size"/>
						<SizeSlider {...props}/>
					</div>
				</CardContent>
			</Card>
		</>
	)
}