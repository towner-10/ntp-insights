import { env } from '@/env.mjs';
import { ImageResult } from 'types';
import { z } from 'zod';

export const uploadImages = async (
	files: File[],
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

	const response = await fetch(`${env.NEXT_PUBLIC_BACKEND_WS_URL}/api/upload`, {
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
