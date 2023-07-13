import { api } from '@/utils/api';
import { useEffect, useState } from 'react';
// import type { FormStateData } from './types';
import { useWebSocketContext } from '@/components/socket-context';
import { useToast } from '@/components/ui/use-toast';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LucideScan, MonitorCheck } from 'lucide-react';
// import { InitialDialogContent } from './initial';
// import { FrameposDialogContent } from './framepos';
// import { SurveyPanoramasDialogContent } from './survey';
// import { ComparisonPanoramasDialogContent } from './comparison';
// import { useWakeLock } from 'react-screen-wake-lock';

export const NewScanDialog = () => {
	// TODO
	return (
		<Button>
			<LucideScan className="pr-2" />
			New Scan
		</Button>
	)
};