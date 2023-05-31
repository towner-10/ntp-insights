import { LucideFilePlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogTrigger,
} from './ui/alert-dialog';
import { useRef, useState } from 'react';

export function New360ViewDialog() {
	const fileRef = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragOver(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			alert(`Uploaded ${e.dataTransfer.files.length} file(s).`);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.target.files && e.target.files[0]) {
			alert(`Uploaded ${e.target.files.length} file(s).`);
		}
	};

	const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragOver(true);
		} else if (e.type === 'dragleave' || e.type === 'drop') {
			setDragOver(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button className="ml-4" variant="outline">
					Test Dialog
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="md:max-w-2xl lg:max-w-4xl">
				<div
					onDragEnter={handleDrag}
					className={`relative flex h-96 flex-col items-center justify-center rounded-md border ${
						dragOver ? 'border-primary' : 'border-muted'
					} text-muted-foreground`}
				>
					<Input
						type="file"
						multiple
						ref={fileRef}
						onChange={handleFileChange}
						className="hidden"
					/>
					<Button
						type="button"
						variant="link"
						onClick={() => fileRef.current?.click()}
						className="flex flex-row items-center justify-center gap-3"
					>
						<p>Drag or click to upload files</p>
						<LucideFilePlus />
					</Button>
					{dragOver && (
						<div
							onDragEnter={handleDrag}
							onDragLeave={handleDrag}
							onDragOver={handleDrag}
							onDrop={handleDrop}
							className="absolute bottom-0 left-0 right-0 top-0 h-full w-full"
						/>
					)}
				</div>
				<AlertDialogFooter className="flex-col items-center pt-2 sm:space-y-2 md:flex-row md:justify-between">
					<div className="flex w-full flex-col md:w-96">
						<Label htmlFor="event-name" className="pb-2">
							Event Name
						</Label>
						<Input id="event-name" defaultValue="Testing" />
						<p className="pt-1 text-xs text-muted-foreground">
							Enter a name to title this storm event.
						</p>
					</div>
					<div className="flex w-full flex-row items-center justify-end space-x-2 pt-2 sm:pt-0 md:w-auto">
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction type="submit">
							Upload and generate URL
						</AlertDialogAction>
					</div>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
