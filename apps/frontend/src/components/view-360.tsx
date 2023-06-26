import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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

const StreetViewImage = (props: { image: string, rotation: number }) => {
	const texture = useLoader(
		THREE.TextureLoader,
		`${props.image.replace('.', '/backend')}`
	);
	texture.mapping = THREE.EquirectangularReflectionMapping;
	texture.minFilter = texture.magFilter = THREE.LinearFilter;
	texture.wrapS = THREE.RepeatWrapping;
	texture.repeat.x = -1;

	useEffect(() => {
		texture.needsUpdate = true;
	}, [texture]);

	return (
		<mesh>
			<sphereGeometry attach="geometry" args={[500, 60, 40, 90]} />
			<meshBasicMaterial
				attach="material"
				map={texture}
				side={THREE.BackSide}
			/>
		</mesh>
	);
};

const CameraController = ({
	startAngle = 0,
	onRotation,
}: {
	startAngle?: number;
	onRotation?: (angle: number) => void;
}) => {
	const { camera, gl } = useThree();
	useEffect(() => {
		let lastAngle = 0;
		const controls = new OrbitControls(camera, gl.domElement);

		// Set camera configuration
		controls.rotateSpeed *= -0.3;
		controls.zoomSpeed = 3;
		controls.maxDistance = 480;

		// Set initial camera angle
		onRotation?.(radToDeg(controls.getAzimuthalAngle()) - startAngle);

		controls.addEventListener('change', () => {
			const angle = radToDeg(controls.getAzimuthalAngle()) - startAngle;
			if (angle !== lastAngle) {
				onRotation?.(angle);
				lastAngle = angle;
			}
		});

		// Clean up
		return () => {
			controls.dispose();
		};
	}, [camera, gl, onRotation, startAngle]);
	return null;
};

export const View360 = (props: {
	image?: Image360 & {
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
	const [fullscreen, setFullscreen] = useState(false);
	const [vr, setVR] = useState(false);
	const [input, setInput] = useState(false);
	const [startingAngle, setStartingAngle] = useState(props.image?.heading || 0);
	const [rotation, setRotation] = useState(props.image?.heading || 0);
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

	if (!props.image) return null;
	if (!props.image.before) return null;

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
			<div className="bg-background/60 hover:bg-foreground/40 hover:text-background absolute z-10 m-2 flex flex-row items-center gap-4 rounded-lg p-2 text-lg backdrop-blur">
				<RadioGroup
					onValueChange={onValueChange}
					value={props.currentImage}
					defaultChecked
					defaultValue="after"
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="before" id="before" />
						<Label htmlFor="before">Before</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="after" id="after" />
						<Label htmlFor="after">After</Label>
					</div>
				</RadioGroup>
			</div>
			<div
				className="bg-background/60 hover:bg-foreground/40 hover:text-background absolute right-0 z-10 m-2 rounded-lg p-2 backdrop-blur transition hover:cursor-pointer"
				onClick={() => setRotation(0)}
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
				<Canvas>
					<XR>
						<MovementController
							hand="right"
							on1={() => {
								props.currentImage == 'after'
									? props.setCurrentImage('before')
									: props.setCurrentImage('after');
							}}
						/>
						<MovementController
							hand='left'
							on1={() => { props.setCurrentImage('before') }} // LT (Before)
							on6={() => { setInput(!input); input ? props.onPrevious?.() : undefined }} // Y (Backward)
						/>
						<MovementController
							hand='right'
							on1={() => { props.setCurrentImage('after') }} // RT (After)
							on6={() => { setInput(!input); input ? props.onNext?.() : undefined }} // B (Forward)
						/>
						{vr ? null : (
							<CameraController
								onRotation={setRotation}
								startAngle={startingAngle}
							/>
						)}
						<Suspense fallback={null}>
							<StreetViewImage
								image={
									props.currentImage === 'after'
										? props.image.image_url
										: props.image.before.image_url
								}
								rotation={degToRad(startingAngle)}
							/>
						</Suspense>
					</XR>
				</Canvas>
			</ErrorBoundary>
		</div>
	);
};
