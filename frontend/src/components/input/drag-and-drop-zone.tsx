import { useRef, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { LucideFilePlus } from 'lucide-react';
import { useWebSocketContext } from '../socket-context';

export function DragAndDropZone() {
	const fileRef = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);
	const [files, setFiles] = useState<File[]>([]);

	const { socket } = useWebSocketContext();

	const handleFiles = (files: FileList) => {
		setFiles(Array.from(files));

		if (socket?.connected) {
			console.log(files);
			socket?.emit('upload', files);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setDragOver(false);
		if (e.dataTransfer.files) {
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
				<p>Drag or click here</p>
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
	);
}
