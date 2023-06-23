import { View360 } from '@/components/view-360';
import { api } from '@/utils/api';
import { Image360 } from 'database';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const Frame: NextPage = () => {
	const router = useRouter();
	const {
		id,
		start,
	}: {
		id?: string;
		start?: number;
	} = router.query;
	const path = api.paths.getPublic.useQuery(
		{
			id: id || '',
		},
		{
			refetchInterval: false,
			refetchOnMount: false,
			refetchOnReconnect: true,
			refetchOnWindowFocus: false,
		}
	);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [currentImage, setCurrentImage] = useState<'before' | 'after'>('after');

	const imagesSorted = path.data?.images
		.filter((image) => {
			return image.source === 'NTP';
		})
		.sort((a: Image360, b: Image360) => {
			if (b.index === null && a.index !== null) return -1;
			else if (a.index === null && b.index !== null) return 1;
			else if (a.index === null && b.index === null) return 0;
			else return (a.index || 0) - (b.index || 0);
		});

	// Set current index to a user defined start index
	useEffect(() => {
		if (start && Number(start) < imagesSorted?.length && Number(start) >= 0) {
			setCurrentIndex(Number(start));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [start]);

	return (
		<View360
			image={imagesSorted?.[currentIndex]}
			currentImage={currentImage}
			setCurrentImage={setCurrentImage}
			onNext={() => {
				if (imagesSorted && currentIndex + 1 < imagesSorted?.length) {
					setCurrentIndex(currentIndex + 1);
				}
			}}
			onPrevious={() => {
				if (imagesSorted && currentIndex - 1 >= 0) {
					setCurrentIndex(currentIndex - 1);
				}
			}}
			onJumpNext={() => {
				if (imagesSorted && currentIndex + 5 < imagesSorted?.length) {
					setCurrentIndex(currentIndex + 5);
				} else {
					setCurrentIndex(imagesSorted?.length - 1);
				}
			}}
			onJumpPrevious={() => {
				if (imagesSorted && currentIndex - 5 >= 0) {
					setCurrentIndex(currentIndex - 5);
				} else {
					setCurrentIndex(0);
				}
			}}
            className='h-screen'
		/>
	);
};

export default Frame;
