import http from 'http';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import { logger } from '../utils/logger';
import { ImageResult } from 'types';
import { getPathUploadData } from '../db';

const IMAGE_DIRECTORY = './images';

export const handleRequest = async (
	req: http.IncomingMessage,
	res: http.ServerResponse<http.IncomingMessage> & {
		req: http.IncomingMessage;
	}
) => {
	// Set CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', 'OPTIONS, GET, POST');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	);

	if (req.method === 'GET' && process.env.NODE_ENV !== 'production') {
		// Check if the request is for one of the files in the images directory
		if (req.url?.startsWith('/images/')) {
			try {
				testImageRequest(req.url);
			} catch (err) {
				logger.error(err);
				res.writeHead(403);
				res.end();
			}

			try {
				const file = await fs.readFile(`./${req.url}`);
				res.writeHead(200, {
					'Content-Type': 'image/jpeg',
				});
				res.write(file);
				res.end();
			} catch (err) {
				logger.error(err);
				res.writeHead(404);
				res.end();
			}
		} else {
			res.writeHead(404);
			res.end();
		}
	} else if (req.method === 'POST') {
		if (req.url === '/api/upload') {
			logger.debug('POST /api/upload');

			const form = formidable({
				multiples: true,
				maxFileSize: 4 * 1024 * 1024 * 1024,
			});

			try {
				form.parse(req, async (err, fields, files) => {
					if (err) {
						logger.error(err);
						res.writeHead(err.httpCode || 400, {
							'Content-Type': 'text/plain',
						});
						res.end(String(err));
						return;
					}

					if (!fields.path_id) {
						logger.error('Missing path_id');
						res.writeHead(400, {
							'Content-Type': 'text/plain',
						});
						res.end('Missing path_id');
						return;
					}

					if (!files.images) {
						logger.error('Missing images');
						res.writeHead(400, {
							'Content-Type': 'text/plain',
						});
						res.end('Missing images');
						return;
					}

					const isMultiple = Array.isArray(files.images);

					const data = {
						id: fields.path_id as string,
						files: isMultiple
							? (files.images as formidable.File[])
							: [files.images as formidable.File],
					};

					const response = await handleUpload(data);

					if (
						!response.length ||
						response.length !== data.files.length
					) {
						logger.error('Error saving images');
						res.writeHead(500, {
							'Content-Type': 'text/plain',
						});
						res.end('Error saving images');
						return;
					}

					res.writeHead(200, {
						'Content-Type': 'application/json',
					});

					res.end(JSON.stringify(response));
				});
			} catch (err) {
				logger.error(err);
				res.writeHead(500, {
					'Content-Type': 'text/plain',
				});
				res.end('Error saving images');
				return;
			}

			return;
		} else {
			res.writeHead(404);
			res.end();
		}
	}
};

const handleUpload = async (data: { id: string; files: formidable.File[] }) => {
	const image_urls: ImageResult[] = [];

	// Fetch folder name from database
	const path_data = await getPathUploadData(data.id);

	if (!path_data) {
		throw new Error('Invalid path_id');
	}

	if (!path_data.editable) {
		throw new Error('Path is not editable');
	}

	const folder_name = path_data.folder_name;

	try {
		await fs.mkdir(`${IMAGE_DIRECTORY}/${folder_name}`, {
			recursive: true,
		});
	} catch (err) {
		logger.error(`Error creating directory ${folder_name}`);
		logger.error(err);
	}

	let count = 0;

	for (const file of data.files) {
		try {
			const filename = file.originalFilename;

			if (!filename) {
				throw new Error('Invalid filename');
			}

			const url = `${IMAGE_DIRECTORY}/${folder_name}/${filename}`;

			await fs.copyFile(file.filepath, url);
			await fs.rm(file.filepath);

			image_urls.push({
				image_name: filename,
				image_url: url,
			});

			count++;
		} catch (err) {
			logger.error(`Error saving ${file.newFilename}`);
			logger.error(err);

			image_urls.push({
				image_name: file.newFilename,
			});
		}
	}

	logger.debug(`Saved ${count} images`);

	return image_urls;
};

export const testImageRequest = (path: string) => {
	// Check REGEX to make sure the path is valid
	if (
		!/^\/images\/[a-zA-Z][a-zA-Z0-9-_]+\/[a-zA-Z0-9]+\.(jpg|jpeg|png|gif)$/g.test(
			path
		)
	) {
		throw new Error('Invalid path');
	}

	return true;
};
