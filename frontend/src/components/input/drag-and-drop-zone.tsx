import { useRef, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LucideFilePlus, LucideTrash } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table';
import format from 'date-fns/format';

type DragAndDropZoneProps = {
	type: 'framepos' | 'survey' | 'comparison';
	processing: boolean;
	requiredFiles?: FileList;
	onFiles?: (files: File[]) => void;
};

export function DragAndDropZone(props: DragAndDropZoneProps) {
	const fileRef = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);
	const [files, setFiles] = useState<File[]>([]);

	const handleFiles = (files: File[]) => {
		if (props.onFiles) props.onFiles(files);
		setFiles(files);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragOver(false);
		if (e.dataTransfer.files && !props.processing) {
			handleFiles(Array.from(e.dataTransfer.files));
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.target.files) {
			handleFiles(Array.from(e.target.files));
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
		<div
			onDragEnter={handleDrag}
			className={`relative flex h-96 max-w-full flex-col items-center justify-center rounded-md border ${
				dragOver ? 'border-primary' : 'border-muted'
			} text-muted-foreground`}
			aria-disabled={props.processing}
		>
			{files.length > 0 && !props.processing && (
				/* Display the files that have been selected */
				<Table className="max-h-full w-full overflow-x-auto overflow-y-auto rounded-md border">
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>{'Size (KB)'}</TableHead>
							<TableHead>Date modified</TableHead>
							<TableHead className="text-right"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{files.map((file) => (
							<TableRow key={file.name} className="overflow-clip">
								<TableCell className="break-all font-medium">
									{file.name}
								</TableCell>
								<TableCell>{Math.round(file.size / 1024)}</TableCell>
								<TableCell>
									{format(file.lastModified, 'MMMM dd, yyyy')}
								</TableCell>
								<TableCell className="p-0 pr-2">
									<Button
										variant="ghost"
										className="text-destructive"
										onClick={() => {
											handleFiles(files.filter((f) => f.name !== file.name));
										}}
									>
										<LucideTrash />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
			<Input
				type="file"
				multiple={props.type !== 'framepos'}
				ref={fileRef}
				onChange={handleFileChange}
				className="hidden"
				disabled={props.processing}
			/>
			<div className="m-4">
				{!props.processing && (
					<Button
						type="button"
						variant="link"
						onClick={() => fileRef.current?.click()}
						disabled={props.processing}
						className="flex flex-row items-center justify-center gap-3"
					>
						<p>Drag or click here</p>
						<LucideFilePlus />
					</Button>
				)}
				{props.processing && (
					<div className="flex flex-row items-center justify-center gap-3">
						<p>Processing...</p>
					</div>
				)}
			</div>
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
	);
}
