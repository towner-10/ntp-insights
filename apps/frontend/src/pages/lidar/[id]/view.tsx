import Head from 'next/head';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { PotreeDetails } from '@/components/potree-details';
import Header from '@/components/header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Toaster } from '@/components/ui/toaster';
import { api } from '@/utils/api';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideExpand, LucideGlasses, LucideShrink, LucideEye, LucideEyeOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { VRButton } from '@react-three/xr';
import { LiDARControls } from '@/components/dialogs/info-dialogs';

const PotreeRenderer = dynamic(() => import('@/components/potree-renderer'), {
	ssr: false,
});

const View: NextPage = () => {
	const session = useSession();
	const router = useRouter();
	const scan = api.scans.getPublic.useQuery({
		id: (router.query.id as string) || '',
	});
	const [currentShape, setCurrentShape] = useState<'circle' | 'square'>('circle');
	const [currentSize, setCurrentSize] = useState<number[]>([1]);

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
			await document.exitFullscreen();
			setFullscreen(false);
		} else {
			await fullscreenRef.current?.requestFullscreen();
			setFullscreen(true);
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
	}

	const renderUI = () => {
		if (!hidden) {
			return (
				<>
					<div className="absolute top-0 left-1/2 z-10 m-2 flex h-0.5 w-0.5 flex-row gap-4 animate-eye-ping">
						<LucideEye />
					</div>
					<div className="absolute bottom-0 right-0 z-10 m-2 flex flex-row gap-4">
						<button
							onClick={() => {
								setVR(!vr);
							}}
							className="bg-background/60 hover:bg-foreground/40 hover:text-background rounded-lg p-2 backdrop-blur transition hover:cursor-pointer"
						>
							<LucideGlasses />
						</button>
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
				<div className="absolute top-0 left-1/2 z-10 m-2 flex h-0.5 w-0.5 flex-row gap-4 animate-eye-ping">
					<LucideEyeOff />
				</div>
			);
		}
	};

	if (!scan.data || scan.isLoading || !scan.data?.scan_location) {
		return (
			<>
				<Head>
					<title>NTP LiDAR - View</title>
					<meta name="description" content="Generated by create-t3-app" />
					<link rel="icon" href="/favicon.ico" />
				</Head>
				<main className="h-screen">
					<Header
						title={
							<>
								NTP <span className="text-success">LiDAR</span>
							</>
						}
						session={session.data}
					/>
					<Toaster />
					<div className="h-screen w-screen">
						<div className="grid lg:grid-cols-4">
							<div className="col-span-3 border-2 border-white">
								<Skeleton className="h-48" />
							</div>
							<div>
								<Skeleton />
							</div>
						</div>
					</div>
				</main>
			</>
		);
	}
	return (
		<>
			<Head>
				<title>NTP LiDAR - View</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="h-screen">
				<Header
					title={
						<>
							NTP <span className="text-success">LiDAR</span>
						</>
					}
					session={session.data}
				/>
				<Toaster />
				<div className="container flex flex-col items-center justify-center p-10">
					<div className="mb-4 flex w-full flex-row items-center gap-4 text-left text-2xl font-medium">
						<h2>{scan.data.name || 'N/A'}</h2>
						<LiDARControls />
					</div>
					
					<div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-6 lg:grid-rows-2">
						<div
							className="relative row-span-2 h-[500px] overflow-hidden rounded-md lg:col-span-4 lg:h-[505px]"
							ref={fullscreenRef}
						>
							<Canvas
								id="potree-canvas"
							>
								<PotreeRenderer shape_type={currentShape === "square" ? 0 : currentShape === "circle" ? 1 : 2} size={currentSize[0]} scan_location={scan.data?.scan_location} />
							</Canvas>
							<div className="absolute bottom-3 left-5 z-10 text-2xl">
								<span className="font-bold">NTP</span> LiDAR
							</div>
							{renderUI()}
							{vr ? <VRButton /> : null}
						</div>
						<PotreeDetails size={currentSize} onSizeChange={setCurrentSize} shape={currentShape} onShapeChange={setCurrentShape}  />
					</div>
				</div>
			</main>
		</>
	);
};

export default View;
