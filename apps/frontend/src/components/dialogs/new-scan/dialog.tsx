import { useEffect, useState } from 'react';
import { useWebSocketContext } from '@/components/socket-context';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LucideScan, MonitorCheck } from 'lucide-react';
import { useWakeLock } from 'react-screen-wake-lock';
import { UploadDialogContent } from './upload';
import { ConfigureDialogContent } from './configure';
import { FormState } from './types';

export const NewScanDialog = () => {
	const [page, setPage] = useState<'upload' | 'config'>('upload');
	const [formState, setFormState] = useState<FormState>();
	const [open, setOpen] = useState(false);
	const { socket } = useWebSocketContext();
	const { isSupported, released, request, release } = useWakeLock();

	useEffect(() => {
		request();

		return () => {
			release();
		};
	}, [request, release]);

	useEffect(() => {
		socket?.on('disconnect', () => {
			setOpen(false);
		});
	}, [socket]);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button>
					<LucideScan className="pr-2" />
					New Scan
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="md:max-w-2xl lg:max-w-4xl">
				<div className="text-muted-foreground absolute right-0 top-0 mr-2 mt-2">
					{isSupported && !released && <MonitorCheck size={16} />}
				</div>
				{page === 'upload' && (
					<UploadDialogContent
						formState={formState}
						onNext={(state) => {
							setFormState(state);
							setPage('config');
						}}
						onCancel={() => {
							setOpen(false);
						}}
					/>
				)}
				{page === 'config' && (
					<ConfigureDialogContent
						formState={formState}
						onNext={() => {
							setOpen(false);
							setPage('upload');
						}}
						onCancel={() => {
							setOpen(false);
							setPage('upload');
						}}
					/>
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
};
