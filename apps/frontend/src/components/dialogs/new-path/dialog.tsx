import { api } from '@/utils/api';
import { useEffect, useState } from 'react';
import type { FormStateData } from './types';
import { useWebSocketContext } from '@/components/socket-context';
import { useToast } from '@/components/ui/use-toast';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LucideFootprints, LucideLock } from 'lucide-react';
import { InitialDialogContent } from './initial';
import { FrameposDialogContent } from './framepos';
import { SurveyPanoramasDialogContent } from './survey';
import { ComparisonPanoramasDialogContent } from './comparison';
import { useWakeLock } from 'react-screen-wake-lock';
import { Badge } from '@/components/ui/badge';

export const NewPathDialog = () => {
	const [page, setPage] = useState<
		'initial' | 'framepos' | 'survey' | 'comparison'
	>('initial');
	const [open, setOpen] = useState(false);
	const [formState, setFormState] = useState<FormStateData>({
		name: '',
		date: new Date(),
		framepos: [],
	});
	const newPath = api.paths.new.useMutation();
	const { socket } = useWebSocketContext();
	const toaster = useToast();

	const { isSupported, released, request, release } = useWakeLock();

	const handleOpen = (value: boolean) => {
		if (socket?.connected) {
			setOpen(value);
			if (value && isSupported) request();
			else release();
		} else {
			toaster.toast({
				title: 'Error',
				description:
					'Lost connection to server. Check your internet connection & try again.',
				duration: 5000,
				variant: 'destructive',
			});
			setOpen(false);
			if (isSupported) release();
		}
	};

	const handleCancel = () => {
		if (isSupported) release();
		setOpen(false);
		setPage('initial');
		setFormState({
			name: '',
			date: new Date(),
			framepos: [],
		});
	};

	const handleError = (error?: string) => {
		toaster.toast({
			title: 'Error',
			description: error ?? 'Something went wrong.',
			duration: 5000,
			variant: 'destructive',
		});

		handleCancel();
	};

	const initialSubmit = (data: FormStateData) => {
		void (async () => {
			const path = await newPath.mutateAsync({
				name: data.name,
				date: data.date,
			});

			if (path) {
				toaster.toast({
					title: 'Success',
					description: 'Path created in database.',
					duration: 5000,
				});

				setFormState({
					...data,
					path_id: path.id,
				});
			} else
				handleError('Path could not be created in database. Try again later.');
		})();
	};

	useEffect(() => {
		socket?.on('disconnect', () => {
			setOpen(false);
		});
	}, [socket]);

	return (
		<AlertDialog open={open} onOpenChange={handleOpen}>
			<AlertDialogTrigger asChild>
				<Button>
					<LucideFootprints className="pr-2" />
					New Path
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className="md:max-w-2xl lg:max-w-4xl">
				<div className="absolute right-0 top-0 mr-2 mt-2">
					{isSupported && !released && <LucideLock size={10} />}
				</div>
				{page === 'initial' && (
					<InitialDialogContent
						formState={formState}
						setFormState={initialSubmit}
						onNext={() => setPage('framepos')}
						onCancel={handleCancel}
					/>
				)}
				{page === 'framepos' && (
					<FrameposDialogContent
						formState={formState}
						setFormState={setFormState}
						onNext={() => setPage('survey')}
						onCancel={handleCancel}
					/>
				)}
				{page === 'survey' && (
					<SurveyPanoramasDialogContent
						formState={formState}
						setFormState={setFormState}
						onNext={() => setPage('comparison')}
						onCancel={handleCancel}
					/>
				)}
				{page === 'comparison' && (
					<ComparisonPanoramasDialogContent
						formState={formState}
						setFormState={(data) => {
							setFormState(data);
							console.log(data);
						}}
						onNext={() => {
							setPage('initial');
							handleOpen(false);
						}}
						onCancel={handleCancel}
					/>
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
};
