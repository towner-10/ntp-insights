import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Suspense, useEffect, useRef, useState } from 'react';
import {
	LucideNavigation2,
	LucideExpand,
	LucideGlasses,
	LucideChevronUp,
	LucideChevronDown,
	LucideChevronsUp,
	LucideChevronsDown,
	LucideShrink,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { VRButton, XR } from '@react-three/xr';
import { degToRad, radToDeg } from 'three/src/math/MathUtils';
import { type Image360 } from '@prisma/client';
import { before } from 'lodash';
import { MovementController } from './movement-controller';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from './ui/button';
import { env } from '@/env.mjs';
import {
	CameraControls,
	Html,
	useProgress,
	useTexture,
} from '@react-three/drei';

const Loader = () => {
	const { progress, errors } = useProgress();

	if (errors.length > 0) {
		return (
			<Html center>
				<div className="flex h-full flex-col items-center justify-center">
					<div className="text-2xl font-bold">Error</div>
					<div className="text-lg">Could not load image!</div>
					<div className="text-sm">
						{errors.map((error) => (
							<p key={error}>{error}</p>
						))}
					</div>
				</div>
			</Html>
		);
	}

	return (
		<Html center>
			<div className="flex h-full flex-col items-center justify-center">
				<div className="text-2xl font-bold">Loading</div>
				<div className="text-lg">{progress.toFixed(2)}%</div>
			</div>
		</Html>
	);
};

const StreetViewImage = (props: { image: string; startingAngle: number }) => {
	const meshRef = useRef<THREE.Mesh>(null);
	const texture = useTexture(
		`${props.image.replace('.', env.NEXT_PUBLIC_BACKEND_URL)}`
	);

	useEffect(() => {
		texture.mapping = THREE.EquirectangularReflectionMapping;
		texture.minFilter = texture.magFilter = THREE.LinearFilter;
		texture.wrapS = THREE.RepeatWrapping;
		texture.repeat.x = -1;
		texture.needsUpdate = true;

		meshRef.current?.setRotationFromAxisAngle(
			new THREE.Vector3(0, 1, 0),
			-props.startingAngle
		);
	}, [texture, props.startingAngle]);

	return (
		<mesh ref={meshRef}>
			<sphereGeometry attach="geometry" args={[500, 60, 40, 90]} />
			<meshBasicMaterial
				attach="material"
				map={texture}
				side={THREE.BackSide}
			/>
		</mesh>
	);
};

export const View360 = (props: {
	image: Image360 & {
		before: Image360 | null;
	};
	currentImage: 'before' | 'after';
	setCurrentImage: (image: 'before' | 'after') => void;
	onNext?: () => void;
	onJumpNext?: () => void;
	onPrevious?: () => void;
	onJumpPrevious?: () => void;
	className?: string;
}) => {
	const cameraControlsRef = useRef<CameraControls>(null);
	const [fullscreen, setFullscreen] = useState(false);
	const [vr, setVR] = useState(false);
	const [input, setInput] = useState(false);
	const [startingAngle, setStartingAngle] = useState(props.image?.heading || 0);
	const [rotation, setRotation] = useState(0);
	const fullscreenRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.addEventListener('fullscreenchange', () => {
			setFullscreen(document.fullscreenElement !== null);
		});

		return () => {
			document.removeEventListener('fullscreenchange', () => {
				setFullscreen(document.fullscreenElement !== null);
			});
		};
	});

	useEffect(() => {
		if (props.currentImage === 'before')
			setStartingAngle(props.image?.before?.heading || 0);
		else setStartingAngle(props.image?.heading || 0);
	}, [props.image, props.currentImage]);

	if (!props.image) {
		return (
			<div className="flex h-full flex-col items-center justify-center">
				<div className="text-2xl font-bold">Error</div>
				<div className="text-lg">Could not load image!</div>
			</div>
		);
	}

	const toggleFullscreen = async () => {
		if (fullscreen) {
			await document.exitFullscreen();
			setFullscreen(false);
		} else {
			await fullscreenRef.current?.requestFullscreen();
			setFullscreen(true);
		}
	};

	const onValueChange = (value: 'before' | 'after') => {
		if (value === 'before') {
			if (!props.image.before) return;
			setStartingAngle(props.image?.before?.heading || 0);
			return props.setCurrentImage('before');
		}

		setStartingAngle(props.image?.heading || 0);
		return props.setCurrentImage('after');
	};

	return (
		<div
			className={props.className}
			ref={fullscreenRef}
			tabIndex={0}
			onKeyDown={(e) => {
				e.preventDefault();
				if (e.key == 'ArrowUp') {
					props.onNext?.();
				} else if (e.key == 'ArrowDown') {
					props.onPrevious?.();
				}
			}}
		>
			<div className="absolute bottom-3 left-5 z-10 text-2xl">
				<span className="font-bold">NTP</span> 360
			</div>
			<div className="bg-background/60 absolute z-10 m-2 flex flex-row items-center gap-4 rounded-lg p-2 text-lg backdrop-blur">
				<RadioGroup
					onValueChange={onValueChange}
					value={props.currentImage}
					defaultChecked
					defaultValue="after"
				>
					{props.image.before && (
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="before" id="before" />
							<Label htmlFor="before">Before</Label>
						</div>
					)}
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="after" id="after" />
						<Label htmlFor="after">After</Label>
					</div>
				</RadioGroup>
			</div>
			<div
				className="bg-background/60 hover:bg-foreground/40 hover:text-background absolute right-0 z-10 m-2 rounded-lg p-2 backdrop-blur transition hover:cursor-pointer"
				onClick={() => {
					if (!cameraControlsRef.current) return;
					cameraControlsRef.current.rotateAzimuthTo(0, true);
				}}
			>
				<LucideNavigation2
					className="transform-gpu"
					style={{
						transform: `rotate(${rotation}deg)`,
					}}
				/>
			</div>
			<div className="absolute bottom-1/2 right-0 top-1/2 z-10 m-2 flex flex-col items-center justify-center gap-4">
				<div
					className="bg-background/60 hover:bg-foreground/40 hover:text-background rounded-lg p-2 backdrop-blur transition hover:cursor-pointer"
					onClick={() => props.onJumpNext?.()}
				>
					<LucideChevronsUp />
				</div>
				<div
					className="bg-background/60 hover:bg-foreground/40 hover:text-background rounded-lg p-2 backdrop-blur transition hover:cursor-pointer"
					onClick={() => props.onNext?.()}
				>
					<LucideChevronUp />
				</div>
				<div
					className="bg-background/60 hover:bg-foreground/40 hover:text-background rounded-lg p-2 backdrop-blur transition hover:cursor-pointer"
					onClick={() => props.onPrevious?.()}
				>
					<LucideChevronDown />
				</div>
				<div
					className="bg-background/60 hover:bg-foreground/40 hover:text-background rounded-lg p-2 backdrop-blur transition hover:cursor-pointer"
					onClick={() => props.onJumpPrevious?.()}
				>
					<LucideChevronsDown />
				</div>
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
			{vr ? <VRButton /> : null}
			<ErrorBoundary
				fallbackRender={({ resetErrorBoundary }) => {
					return (
						<div className="flex h-full flex-col items-center justify-center">
							<div className="text-2xl font-bold">Error</div>
							<div className="text-lg">Could not load image!</div>
							<Button className="mt-4" onClick={resetErrorBoundary}>
								Retry
							</Button>
						</div>
					);
				}}
			>
				<Canvas className="touch-none">
					<CameraControls
						ref={cameraControlsRef}
						dollySpeed={2}
						minZoom={0.5}
						azimuthRotateSpeed={-0.5}
						polarRotateSpeed={-0.5}
						draggingSmoothTime={0}
						makeDefault
						// https://github.com/yomotsu/camera-controls/blob/cee042753169f3bbeb593833ce92d70d52b6862f/src/types.ts#L29C1-L47
						mouseButtons={{
							left: 1,
							middle: 0,
							right: 0,
							wheel: 16,
						}}
						touches={{
							one: 32,
							two: 512,
							three: 0,
						}}
						onChange={() => {
							if (!cameraControlsRef.current) return;
							cameraControlsRef.current.normalizeRotations();
							setRotation(radToDeg(cameraControlsRef.current.azimuthAngle));
						}}
					/>
					<XR>
						<MovementController
							hand="left"
							on1={() => {
								setInput(!input);
								input ? props.onJumpPrevious?.() : undefined;
							}} // Left Grip (Jump Backward)
							on0={() => {
								setInput(!input);
								input ? props.onPrevious?.() : undefined;
							}} // Left Trigger (Backward)
							on5={() => {
								props.setCurrentImage('before');
							}} // Y (Before)
						/>
						<MovementController
							hand="right"
							on1={() => {
								setInput(!input);
								input ? props.onJumpNext?.() : undefined;
							}} // Right Grip (Jump Forward)
							on0={() => {
								setInput(!input);
								input ? props.onNext?.() : undefined;
							}} // Right Trigger (Forward)
							on5={() => {
								props.setCurrentImage('after');
							}} // B (After)
						/>
						<Suspense fallback={<Loader />}>
							<StreetViewImage
								startingAngle={degToRad(startingAngle)}
								image={
									props.currentImage === 'after'
										? props.image.image_url
										: props.image.before.image_url
								}
							/>
						</Suspense>
					</XR>
				</Canvas>
			</ErrorBoundary>
		</div>
	);
};
