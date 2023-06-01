import { useRef, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LucideFilePlus } from 'lucide-react';
import { useWebSocketContext } from '../socket-context';

type DragAndDropZoneProps = {
	type: 'framepos' | 'survey' | 'comparison';
	processing: boolean;
	onFiles?: (files: File[]) => void;
	callback?: (data: unknown) => void;
};

export function DragAndDropZone(props: DragAndDropZoneProps) {
	const fileRef = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);
	const [files, setFiles] = useState<File[]>([]);

	const { socket } = useWebSocketContext();

	const handleFiles = (files: FileList) => {
		if (props.onFiles) props.onFiles(Array.from(files));
		setFiles(Array.from(files));

		if (socket?.connected) {
			if (props.type === 'framepos') {
				socket?.compress(false).emit(
					'upload',
					{
						uploadType: 'framepos',
						files: Array.from(files),
					},
					(
						data: [
							{
								frame_index: string;
								lat: number;
								lon: number;
								pano_id: string;
							}
						]
					) => {
						if (props.callback) props.callback(data);
					}
				);
			}
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragOver(false);
		if (e.dataTransfer.files && !props.processing) {
			handleFiles(e.dataTransfer.files);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.target.files) {
			handleFiles(e.target.files);
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
			className={`relative flex h-96 flex-col items-center justify-center rounded-md border ${
				dragOver ? 'border-primary' : 'border-muted'
			} text-muted-foreground`}
			aria-disabled={props.processing}
		>
			<div className="flex max-h-full w-full flex-col overflow-y-auto overflow-x-clip">
				{files.length > 0 && !props.processing && (
					<div className="flex flex-col items-center justify-center gap-2">
						{files.map((file) => (
							<div
								key={file.name}
								className="flex select-none flex-row items-center justify-center gap-2"
							>
								<p>{file.name}</p>
							</div>
						))}
					</div>
				)}
			</div>
			<Input
				type="file"
				multiple={props.type !== 'framepos'}
				ref={fileRef}
				onChange={handleFileChange}
				className="hidden"
				disabled={props.processing}
			/>
			<div className='m-4'>
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
