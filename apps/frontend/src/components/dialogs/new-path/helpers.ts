import { ImageResult } from 'types';
import { z } from 'zod';
import { env } from '@/env.mjs';

export const batchUploadImages = async (
	files: File[],
	folder_name: string,
	path_id: string,
	onError: ({
		userMessage,
		consoleMessage,
	}: {
		userMessage: string;
		consoleMessage: string;
	}) => void
): Promise<ImageResult[] | null> => {
	// Split the files into batches of 100
	const batches = files.reduce((acc, file, index) => {
		const batchIndex = Math.floor(index / 100);
		
		if (!acc[batchIndex]) {
			acc[batchIndex] = [];
		}

		acc[batchIndex].push(file);

		return acc;
	}, [] as File[][]);

	// Upload each batch
	const results = await Promise.all(
		batches.map((batch) => uploadImages(batch, folder_name, path_id, onError))
	);

	// If any of the batches failed
	if (results.some((result) => result === null)) {
		return null;
	}

	// Flatten the results
	return results.flat();
};

const uploadImages = async (
	files: File[],
	folder_name: string,
	path_id: string,
	onError: ({
		userMessage,
		consoleMessage,
	}: {
		userMessage: string;
		consoleMessage: string;
	}) => void
): Promise<ImageResult[] | null> => {
	const body = new FormData();

	const bufferFiles = await Promise.all(
		files.map(async (file) => {
			return {
				name: file.name,
				buffer: await file.arrayBuffer(),
			};
		})
	);

	body.append('path_id', path_id);

	for (const image of bufferFiles) {
		body.append('images', new Blob([image.buffer]), image.name);
	}

	const response = await fetch(env.NEXT_PUBLIC_BACKEND_URL + '/api/upload/' + folder_name, {
		method: 'POST',
		body: body,
	});

	// If the request failed
	if (!response.ok) {
		onError({
			userMessage:
				'Failed to upload images. Make sure you are uploading < 4GB.',
			consoleMessage: `Failed to upload images. Make sure you are uploading < 4GB. ${response.status}`,
		});

        return null;
	}

	// Parse the response
	const data = await response.json();

	const responseType = z.array(
		z.object({
			image_name: z.string(),
			image_url: z.string(),
		})
	);

	// If the response is not valid
	if (!responseType.safeParse(data).success) {
		throw new Error('Invalid response from backend');
	}

	// Parse the response as ImageResult[]
	const result = responseType.parse(data) as ImageResult[];

	// If the images could not be uploaded
	if (!result.length) {
		onError({
			userMessage:
				'Images could not be uploaded to the server. Check the console for more information.',
			consoleMessage:
				'Error parsing response from backend. Check the backend logs for more information.',
		});

        return null;
	}

	return result;
};
