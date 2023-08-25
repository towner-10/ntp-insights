import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { FlyControls, PointerLockControls } from '@react-three/drei';
import { type PointCloudOctree, Potree } from 'potree-core';
import { env } from '@/env.mjs';
import { MovementController } from './movement-controller';
import { XR } from '@react-three/xr';

const potree = new Potree();
potree.pointBudget = 2_000_000;

const PotreeRenderer = ({
	scan_location,
	shape_type,
	size_mode,
	size,
}: {
	scan_location: string;
	shape_type: number;
	size_mode: number;
	size: number;
}) => {
	const { scene } = useThree();
	const [pointClouds, setPointClouds] = useState<PointCloudOctree[]>([]);

	useEffect(() => {
		if (!scan_location) return;

		(async () => {
			const result = await potree.loadPointCloud(
				'metadata.json',
				(url) => `${env.NEXT_PUBLIC_BACKEND_URL}/pointclouds/${scan_location}/${url}`
			);

			// Ensure the axes are aligned with the world axes
			result.rotation.x = -Math.PI / 2;
			
			// Set material properties of the point cloud (point size, colour, shape, etc.)
			result.material.pointSizeType = size_mode;  // adaptive point size
			result.material.size = size;
			result.material.shape = shape_type;
			result.material.outputColorEncoding = 1;   // sRGB encoding
		
			scene.add(result);
			setPointClouds([...pointClouds, result]);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scan_location, shape_type, size_mode, size]);

	useFrame(({ gl, camera }) => {
		potree.updatePointClouds(pointClouds, camera, gl);

		gl.render(scene, camera);
	});

	return (
		<>
			<PointerLockControls makeDefault selector='#potree-canvas'>
				<FlyControls movementSpeed={5} rollSpeed={0} />
			</PointerLockControls>
			<XR>
				<MovementController
					hand="left"
					on3Fwd={() => {
						document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
					}} // Left Stick Forward (Moving Forward)
					on3Bwd={() => {
						document.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
					}} // Left Stick Backward (Moving Backward)
					on2Left={() => {
						document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
					}} // Left Stick Left (Moving Left)
					on2Right={() => {
						document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
					}} // Left Stick Right (Moving Right)
				/>
				<MovementController
					hand="right"
					on3Fwd={() => {
						document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
					}} // Right Stick Forward (Moving Up)
					on3Bwd={() => {
						document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f' }));
					}} // Right Stick Backward (Moving Down)
				/>
			</XR>
		</>
	);
};

export default PotreeRenderer;
