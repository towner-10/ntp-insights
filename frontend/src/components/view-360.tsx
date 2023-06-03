import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import { Suspense, useEffect, useRef, useState } from 'react';
import {
	LucideNavigation2,
	LucideExpand,
	LucideGlasses,
	LucideArrowUp,
	LucideArrowDown,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Controllers, VRButton, XR } from '@react-three/xr';
import { radToDeg } from 'three/src/math/MathUtils';
import { type Image360 } from '@prisma/client';

const StreetViewImage = (props: { image: string }) => {
	const texture = useLoader(
		THREE.TextureLoader,
		`${props.image.replace('.', 'http://localhost:8000')}`
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
	onNext?: () => void;
	onPrevious?: () => void;
	className?: string;
}) => {
	const [fullscreen, setFullscreen] = useState(false);
	const [vr, setVR] = useState(false);
	const [startingAngle, setStartingAngle] = useState(props.image?.heading || 0);
	const [rotation, setRotation] = useState(props.image?.heading || 0);
	const [currentImage, setCurrentImage] = useState<'before' | 'after'>('after');
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
		if (currentImage === 'before')
			setStartingAngle(props.image?.before?.heading || 0);
		else
			setStartingAngle(props.image?.heading || 0);
	}, [props.image, currentImage])

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

	return (
		<div className={props.className} ref={fullscreenRef}>
			<div className="absolute bottom-3 left-5 z-10 text-2xl">
				<span className="font-bold">NTP</span> 360
			</div>
			<div className="absolute z-10 m-2 flex flex-row items-center gap-4 rounded-lg bg-background/60 p-2 text-lg backdrop-blur">
				<RadioGroup
					onValueChange={(value) => {
						if (value === 'before') {
							setStartingAngle(props.image?.before?.heading || 0);
							setCurrentImage('before');
						} else {
							setStartingAngle(props.image?.heading || 0);
							setCurrentImage('after');
						}
					}}
					value={currentImage}
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
				className="absolute right-0 z-10 m-2 rounded-lg bg-background/60 p-2 backdrop-blur transition hover:cursor-pointer hover:bg-foreground/40 hover:text-background"
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
				<div className="rounded-lg bg-background/60 p-2 backdrop-blur transition hover:cursor-pointer hover:bg-foreground/40 hover:text-background" onClick={() => props.onNext?.()}>
					<LucideArrowUp />
				</div>
				<div className="rounded-lg bg-background/60 p-2 backdrop-blur transition hover:cursor-pointer hover:bg-foreground/40 hover:text-background" onClick={() => props.onPrevious?.()}>
					<LucideArrowDown />
				</div>
			</div>
			<div className="absolute bottom-0 right-0 z-10 m-2 flex flex-row gap-4">
				<button
					onClick={() => {
						setVR(!vr);
					}}
					className="rounded-lg bg-background/60 p-2 backdrop-blur transition hover:cursor-pointer hover:bg-foreground/40 hover:text-background"
				>
					<LucideGlasses />
				</button>
				<button
					onClick={() => {
						void (async () => {
							await toggleFullscreen();
						})();
					}}
					className="rounded-lg bg-background/60 p-2 backdrop-blur transition hover:cursor-pointer hover:bg-foreground/40 hover:text-background"
				>
					<LucideExpand />
				</button>
			</div>
			{vr ? <VRButton /> : null}
			<Canvas>
				<XR>
					<Controllers />
					{vr ? null : (
						<CameraController
							onRotation={setRotation}
							startAngle={startingAngle}
						/>
					)}
					<Suspense fallback={<></>}>
						<StreetViewImage
							image={
								currentImage === 'after'
									? props.image.image_url
									: props.image.before.image_url
							}
						/>
					</Suspense>
				</XR>
			</Canvas>
		</div>
	);
};
