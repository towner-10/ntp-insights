import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import { Suspense, useEffect, useRef, useState } from 'react';
import { LucideArrowUp, LucideExpand, LucideGlasses } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Controllers, VRButton, XR } from '@react-three/xr';

const StreetViewImage = () => {
	const texture = useLoader(THREE.TextureLoader, './test.jpg');
	texture.mapping = THREE.EquirectangularReflectionMapping;
	texture.minFilter = texture.magFilter = THREE.LinearFilter;
	texture.wrapS = THREE.RepeatWrapping;
	texture.repeat.x = -1;
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

const CameraController = () => {
	const { camera, gl } = useThree();
	useEffect(() => {
		const controls = new OrbitControls(camera, gl.domElement);

		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.zoomSpeed = 0.5;
		controls.screenSpacePanning = false;
		controls.maxDistance = 480;	

		controls.addEventListener('change', () => {
			console.log(controls.getDistance());
		});

		return () => {
			controls.dispose();
		};
	}, [camera, gl]);
	return null;
};

export const View360 = () => {
	const [fullscreen, setFullscreen] = useState(false);
	const [vr, setVR] = useState(false);
	const fullscreenRef = useRef<HTMLCanvasElement>(null);

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
		<>
			<div className="absolute bottom-3 left-5 z-10 text-2xl">
				<span className="font-bold">NTP</span> 360
			</div>
			<div className="absolute z-10 m-2 flex flex-row items-center gap-4 rounded-lg bg-background/60 p-2 text-lg backdrop-blur">
				<RadioGroup>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="option-one" id="option-one" />
						<Label htmlFor="option-one">2020</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="option-two" id="option-two" />
						<Label htmlFor="option-two">2023</Label>
					</div>
				</RadioGroup>
			</div>
			<div className="absolute right-0 z-10 m-2 rounded-lg bg-background/60 p-2 backdrop-blur transition hover:cursor-pointer hover:bg-foreground/40 hover:text-background">
				<LucideArrowUp
					className="transform-gpu"
					style={{
						transform: `rotate(${0}deg)`,
					}}
				/>
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
			<Canvas ref={fullscreenRef}>
				<XR>
					<Controllers />
					{vr ? null : <CameraController />}
					<Suspense fallback={null}>
						<StreetViewImage />
					</Suspense>
				</XR>
			</Canvas>
		</>
	);
};
