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
	}) => void,
	onProgress?: (sent: number, total: number) => void
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

	const progressArray = new Array(batches.length).fill({
		sent: 0,
		total: 0,
	});

	// Upload each batch
	const results = await Promise.all(
		batches.map((batch, index) =>
			uploadImages(batch, folder_name, path_id, onError, (sent, total) => {
				progressArray[index] = {
					sent,
					total,
				};
				onProgress?.(
					progressArray.reduce((acc, curr) => acc + curr.sent, 0),
					progressArray.reduce((acc, curr) => acc + curr.total, 0)
				);
			})
		)
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
	}) => void,
	onProgress?: (sent: number, total: number) => void
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

	// Calculate the total size of the form data
	const totalSize = bufferFiles.reduce((acc, curr) => {
		return acc + curr.buffer.byteLength;
	}, 0);

	// Use XMLHttpRequest to track upload progress and use it within a promise
	try {
		const response = await new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.responseType = 'json';

			xhr.open('POST', env.NEXT_PUBLIC_BACKEND_URL + '/api/upload');

			xhr.addEventListener('loadstart', () => {
				console.log('Started uploading images');
			});

			xhr.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					onProgress?.(event.loaded, event.total);
				} else {
					onProgress?.(event.loaded, totalSize);
				}
			});

			xhr.addEventListener('load', () => {
				console.log('Finished uploading images');
				resolve(xhr.response);
			});

			xhr.addEventListener('error', () => {
				console.log('Error uploading images');
				reject(xhr.response);
			});

			xhr.addEventListener('abort', () => {
				console.log('Aborted uploading images');
				reject(xhr.response);
			});

			xhr.send(body);
		});

		const responseType = z.array(
			z.object({
				image_name: z.string(),
				image_url: z.string(),
			})
		);

		// If the response is not valid
		if (!responseType.safeParse(response).success) {
			throw new Error('Invalid response from backend');
		}

		// Parse the response as ImageResult[]
		const result = responseType.parse(response) as ImageResult[];

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
	} catch (err) {
		onError({
			userMessage:
				'Failed to upload images. Make sure you are uploading < 4GB.',
			consoleMessage: `Failed to upload images. Make sure you are uploading < 4GB. ${err}`,
		});

		return null;
	}
};
