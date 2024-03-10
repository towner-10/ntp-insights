import Head from 'next/head';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { PotreeDetails, PotreeControls } from '@/components/potree-cards';
import Header from '@/components/header';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Toaster } from '@/components/ui/toaster';
import { api } from '@/utils/api';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideExpand, LucideShrink, LucideEye, LucideEyeOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LiDARControls } from '@/components/dialogs/info-dialogs';

const PotreeFull = dynamic(() => import('@/components/potree-full'), {
	ssr: false,
});

const View: NextPage = () => {
	const session = useSession();
	const router = useRouter();
	const scan = api.scans.getPublic.useQuery({
		id: (router.query.id as string) || '',
	});

	// States for UI
	const [fullscreen, setFullscreen] = useState(false);
	const [hidden, setHidden] = useState(false);

	// States for LiDAR propertiese
	const [size, setSize] = useState<number[]>([1]);
	const [count, setCount] = useState<number[]>([200000]);
	//const [shape, setShape] = useState<"circle" | "square">("circle");

	// States for external script loading
	const [scriptsLoaded, setScriptsLoaded] = useState(false);
	const [viewerLoaded, setViewerLoaded] = useState(false);

	const fullscreenRef = useRef<HTMLDivElement>(null);

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
					{fullscreen ? 
					<div className="absolute top-0 left-0 z-10 m-2 flex flex-row gap-4">
					</div> : <></>}
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
						<div className="relative row-span-3 h-[500px] overflow-hidden rounded-md lg:col-span-4 lg:h-[627px]" ref={fullscreenRef}>
							<PotreeFull set_script_loaded={setScriptsLoaded} script_loaded={scriptsLoaded} set_viewer_loaded={setViewerLoaded} scan_location={scan.data?.scan_location} />
							<div className="absolute bottom-3 left-5 z-10 text-2xl">
								<span className="font-bold">NTP</span> LiDAR
							</div>
							{renderUI()}
						</div>
						<PotreeDetails event_date={scan.data?.event_date} date_taken={scan.data?.date_taken} scan_location={scan.data?.scan_location} scan_size={scan.data?.scan_size} scan_type={scan.data?.scan_type} />
						{viewerLoaded ? <PotreeControls size={size} onSizeChange={setSize} count={count} onCountChange={setCount} /> : <></>}
						
					</div>
				</div>
			</main>
		</>
	);
};

export default View;
