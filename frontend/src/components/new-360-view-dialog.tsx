import { Button } from './ui/button';
import { Label } from './ui/label';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogTrigger,
} from './ui/alert-dialog';
import { useEffect, useState } from 'react';
import { DragAndDropZone } from './input/drag-and-drop-zone';
import { Input } from './ui/input';
import { useWebSocketContext } from './socket-context';
import { useToast } from './ui/use-toast';

type DialogContentProps = {
	onNext: () => void;
	onCancel: () => void;
};

function DialogContentHeader(props: {
	index: number;
	title: React.ReactNode;
	description: React.ReactNode;
}) {
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
}

function FramePosDialogContent(props: DialogContentProps) {
	const [processing, setProcessing] = useState(false);

	return (
		<>
			<DragAndDropZone type='framepos' processing={processing} onFiles={() => setProcessing(true)} callback={(data) => {
				console.log(data);
				setProcessing(false);
			}} />
			<AlertDialogFooter className="flex-col items-center pt-2 sm:space-y-2 md:flex-row md:justify-between">
				<DialogContentHeader
					index={1}
					title={<span>Upload the <code>framepos</code> text file</span>}
					description={
						'This stores the necessary geospatial data for each panorama.'
					}
				/>
				<div className="flex w-full flex-row items-center justify-end space-x-2 pt-2 sm:pt-0 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel} disabled={processing}>Cancel</AlertDialogCancel>
					<Button type="button" onClick={props.onNext} disabled={processing}>
						Next
					</Button>
				</div>
			</AlertDialogFooter>
		</>
	);
}

function SurveyPanoramasDialogContent(props: DialogContentProps) {
	return (
		<>
			<DragAndDropZone type='survey' processing={false} />
			<AlertDialogFooter className="flex-col items-center pt-2 sm:space-y-2 md:flex-row md:justify-between">
				<DialogContentHeader
					index={2}
					title={'Upload the survey panoramas'}
					description={
						<>
							<span>{'0 / 233'}</span>
							<span> panoramas uploaded.</span>
						</>
					}
				/>
				<div className="flex w-full flex-row items-center justify-end space-x-2 pt-2 sm:pt-0 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel}>Cancel</AlertDialogCancel>
					<Button type="button" onClick={props.onNext}>
						Next
					</Button>
				</div>
			</AlertDialogFooter>
		</>
	);
}

function ComparisonPanoramasDialogContent(props: DialogContentProps) {
	return (
		<>
			<DragAndDropZone type='comparison' processing={false} />
			<AlertDialogFooter className="flex-col items-center pt-2 sm:space-y-2 md:flex-row md:justify-between">
				<DialogContentHeader
					index={3}
					title={'Upload the comparison panoramas'}
					description={
						<>
							<span>
								Click here to copy the panorama IDs to your clipboard.
							</span>
							<span>{' 0 / 203 '}</span>
							<span>panoramas uploaded.</span>
						</>
					}
				/>
				<div className="flex w-full flex-row items-center justify-end space-x-2 pt-2 sm:pt-0 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel}>Cancel</AlertDialogCancel>
					<Button type="button" onClick={props.onNext}>
						Done
					</Button>
				</div>
			</AlertDialogFooter>
		</>
	);
}

function NameDialogContent(props: DialogContentProps) {
	return (
		<>
			<AlertDialogFooter className="flex-col items-center sm:space-y-2 md:flex-row md:justify-between">
				<div className="flex w-full flex-col md:w-96 lg:w-[500px]">
					<Label htmlFor="event-name" className="pb-2">
						Event Name
					</Label>
					<Input id="event-name" defaultValue="Testing" />
					<p className="pt-1 text-xs text-muted-foreground">
						Enter a name to title this storm event.
					</p>
				</div>
				<div className="flex w-full flex-row items-center justify-end space-x-2 pt-2 sm:pt-0 md:w-auto">
					<AlertDialogCancel onClick={props.onCancel}>Cancel</AlertDialogCancel>
					<AlertDialogAction type="submit" onClick={props.onNext}>
						Generate URL
					</AlertDialogAction>
				</div>
			</AlertDialogFooter>
		</>
	);
}

export function New360ViewDialog() {
	const [page, setPage] = useState(0);
	const [open, setOpen] = useState(false);
	const { socket } = useWebSocketContext();
	const toaster = useToast();

	const handleOpen = (value: boolean) => {
		if (socket?.connected) setOpen(value);
		else {
			toaster.toast({
				title: 'Error',
				description: 'Not connected to server',
				duration: 5000,
				variant: 'destructive',
			});
			setOpen(false);
		}
	};

	useEffect(() => {
		socket?.on('disconnect', () => {
			setOpen(false);
		});
	}, [socket]);

	return (
		<AlertDialog open={open} onOpenChange={handleOpen}>
			<AlertDialogTrigger asChild>
				<Button className="ml-4" variant="outline">
					Upload a new event capture
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="md:max-w-2xl lg:max-w-4xl">
				{page === 0 && (
					<FramePosDialogContent
						onNext={() => {
							setPage(1);
						}}
						onCancel={() => {
							console.log('cancel');
							setPage(0);
						}}
					/>
				)}
				{page === 1 && (
					<SurveyPanoramasDialogContent
						onNext={() => {
							setPage(2);
						}}
						onCancel={() => {
							console.log('cancel');
							setPage(0);
						}}
					/>
				)}
				{page === 2 && (
					<ComparisonPanoramasDialogContent
						onNext={() => {
							setPage(3);
						}}
						onCancel={() => {
							console.log('cancel');
							setPage(0);
						}}
					/>
				)}
				{page === 3 && (
					<NameDialogContent
						onNext={() => {
							setPage(0);
						}}
						onCancel={() => {
							console.log('cancel');
							setPage(0);
						}}
					/>
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
}
