import { promises as fs } from 'fs';
import { logger } from '../utils/logger';
import { ImageResult } from 'types';
import formidable from 'formidable';

const IMAGE_DIRECTORY = './images';

export const handleUpload = async (data: {
	id: string;
	files: formidable.File[];
}) => {
	const image_urls: ImageResult[] = [];

	try {
		await fs.mkdir(`${IMAGE_DIRECTORY}/${data.id}`, {
			recursive: true,
		});
	} catch (err) {
		logger.error(`Error creating directory ${data.id}`);
		logger.error(err);
	}

	for (const file of data.files) {
		try {
			const filename =
				file.originalFilename?.replace(/[^a-z0-9.]/gi, '_');

			if (!filename) {
				throw new Error('Invalid filename');
			}

			const url = `${IMAGE_DIRECTORY}/${data.id}/${filename}`;

			await fs.writeFile(url, file.toString());

			image_urls.push({
				image_name: filename,
				image_url: url,
			});

			logger.debug(`Saved ${filename}`);
		} catch (err) {
			logger.error(`Error saving ${file.newFilename}`);
			logger.error(err);

			image_urls.push({
				image_name: file.newFilename,
			});
		}
	}

	return image_urls;
};
