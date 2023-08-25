import { api } from '@/utils/api';
import { Canvas } from '@react-three/fiber';
import { VRButton } from '@react-three/xr';
import {
	LucideExpand,
	LucideEye,
	LucideEyeOff,
	LucideShrink,
} from 'lucide-react';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

const PotreeRenderer = dynamic(() => import('@/components/potree-renderer'), {
	ssr: false,
});

const Frame: NextPage = () => {
	const router = useRouter();
	const scan = api.scans.getPublic.useQuery(
		{
			id: (router.query.id as string) || '',
		},
		{
			refetchInterval: false,
			refetchOnMount: false,
			refetchOnReconnect: true,
			refetchOnWindowFocus: false,
		}
	);

	const [fullscreen, setFullscreen] = useState(false);
	const [hidden, setHidden] = useState(false);
	const fullscreenRef = useRef<HTMLDivElement>(null);
	const [vr, setVR] = useState(false);

	useEffect(() => {
		document.addEventListener('fullscreenchange', () => {
			setFullscreen(document.fullscreenElement !== null);
		});

		document.addEventListener('keydown', toggleUI);
		document.addEventListener('keydown', toggleFocus);

		return () => {
			document.removeEventListener('fullscreenchange', () => {
				setFullscreen(document.fullscreenElement !== null);
			});

			document.removeEventListener('keydown', toggleUI);
			document.removeEventListener('keydown', toggleFocus);
		};
	});

	const toggleFullscreen = async () => {
		if (fullscreen) {
			try {
				await document.exitFullscreen();
				setFullscreen(false);
			} catch (err) {
				console.log(err);
			}
		} else {
			try {
				await fullscreenRef.current?.requestFullscreen();
				setFullscreen(true);
			} catch (err) {
				console.log(err);
			}
		}
	};

	const renderUI = () => {
		if (!hidden) {
			return (
				<>
					<div className="animate-eye-ping absolute left-1/2 top-0 z-10 m-2 flex h-0.5 w-0.5 flex-row gap-4">
						<LucideEye />
					</div>
					<div className="absolute bottom-0 right-0 z-10 m-2 flex flex-row gap-4">
						<button
							onClick={() => {
								void (async () => {
									await toggleFullscreen();
								})();
							}}
							className="bg-background/60 hover:bg-foreground/40 hover:text-background rounded-lg p-2 backdrop-blur transition hover:cursor-pointer"
						>
							{fullscreen ? <LucideShrink /> : <LucideExpand />}
						</button>
					</div>
				</>
			);
		} else {
			return (
				<div className="animate-eye-ping absolute left-1/2 top-0 z-10 m-2 flex h-0.5 w-0.5 flex-row gap-4">
					<LucideEyeOff />
				</div>
			);
		}
	};

	const toggleUI = (event: KeyboardEvent) => {
		if (event.key.toLowerCase() === 'h') {
			setHidden(!hidden);
		}
	};

	const toggleFocus = (event: KeyboardEvent) => {
		if (event.key.toLowerCase() === 'p') {
			document.exitPointerLock();
		}
	};

	return (
		<div className="relative h-screen" ref={fullscreenRef}>
			<Canvas id="potree-canvas">
				<PotreeRenderer
					shape_type={1}
					size_mode={2}
					size={1}
					scan_location={scan.data?.scan_location}
				/>
			</Canvas>
			<div className="absolute bottom-3 left-5 z-10 text-2xl">
				<span className="font-bold">NTP</span> LiDAR
			</div>
			{renderUI()}
			{vr ? <VRButton /> : null}
		</div>
	);
};

export default Frame;
