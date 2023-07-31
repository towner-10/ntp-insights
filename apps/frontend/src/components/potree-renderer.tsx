import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { FlyControls, PointerLockControls } from '@react-three/drei';
import { type PointCloudOctree, Potree } from 'potree-core';
import { env } from '@/env.mjs';

const potree = new Potree();
potree.pointBudget = 2_000_000;

const PotreeRenderer = ({
	scan_location
}: {
	scan_location: string;
}) => {
	const { scene } = useThree();
	const [pointClouds, setPointClouds] = useState<PointCloudOctree[]>([]);

	useEffect(() => {
		(async () => {
			const result = await potree.loadPointCloud(
				'metadata.json',
				(url) => `${env.NEXT_PUBLIC_BACKEND_URL}/pointclouds/${scan_location}/${url}`
			);

			// Ensure the axes are aligned with the world axes
			result.rotation.x = -Math.PI / 2;
			
			// Set material properties of the point cloud (point size, colour, shape, etc.)
			result.material.size = 1.2;
			result.material.shape = 1;
			result.material.inputColorEncoding = 1;
			result.material.outputColorEncoding = 1;

			scene.add(result);
			setPointClouds([...pointClouds, result]);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useFrame(({ gl, camera }) => {
		potree.updatePointClouds(pointClouds, camera, gl);

		gl.render(scene, camera);
	});

	return (
		<>
			<PointerLockControls makeDefault selector='#potree-canvas'>
				<FlyControls movementSpeed={5} rollSpeed={0} />
			</PointerLockControls>
		</>
	);
};

export default PotreeRenderer;
