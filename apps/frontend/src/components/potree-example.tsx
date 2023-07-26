import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { type PointCloudOctree, Potree } from 'potree-core';

const potree = new Potree();
potree.pointBudget = 2_000_000;

const PotreeExample = () => {
	const { scene } = useThree();
	const [pointClouds, setPointClouds] = useState<PointCloudOctree[]>([]);

	useEffect(() => {
		(async () => {
			const result = await potree.loadPointCloud(
				'metadata.json',
				(url) => `/potree/${url}`
			);

			scene.add(result);
			setPointClouds([...pointClouds, result]);
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useFrame(({ gl, camera }) => {
		potree.updatePointClouds(pointClouds, camera, gl);
	});

	return <OrbitControls makeDefault />;
};

export default PotreeExample;
