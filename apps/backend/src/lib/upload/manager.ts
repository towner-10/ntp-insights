import { promises as fs } from 'fs';
import { logger } from '../../utils/logger';

type ImageResult = {
	image_name: string;
	image_url?: string;
};

// Data received from client
type UploadData = {
	uploadType: 'framepos' | 'survey' | 'comparison';
	id?: string;
	files: {
		name: string;
		buffer: Buffer;
	}[];
};

// Data sent to client
type CallbackData = ImageResult[] | null;

const IMAGE_DIRECTORY =
	'.\\images';

export const handleUpload = async (
	data: UploadData,
	callback: (data: CallbackData) => void
) => {
	switch (data.uploadType) {
		case 'framepos':
			return logger.warn('Framepos deprecated');
		case 'survey':
		case 'comparison':
			const image_urls: ImageResult[] = [];

			try {
				await fs.mkdir(`${IMAGE_DIRECTORY}\\${data.id}`, {
					recursive: true,
				});
			} catch (err) {
				logger.error(`Error creating directory ${data.id}`);
				logger.error(err);
			}

			for (const file of data.files) {
				try {
					const url = `${IMAGE_DIRECTORY}\\${data.id}\\${file.name}`;

					await fs.writeFile(url, file.buffer);

					image_urls.push({
						image_name: file.name,
						image_url: url,
					});

					logger.debug(`Saved ${file.name}`);
				} catch (err) {
					logger.error(`Error saving ${file.name}`);
					logger.error(err);

					image_urls.push({
						image_name: file.name,
					});
				}
			}

			return callback(image_urls);
	}
};
