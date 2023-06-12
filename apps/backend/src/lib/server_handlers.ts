import http from 'http';
import formidable from 'formidable';
import parseCookies from '../utils/parseCookies';
import { promises as fs } from 'fs';
import { logger } from '../utils/logger';
import { ImageResult } from 'types';
import { verifyAccessToken } from '../db';

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

	if (req.method === 'GET') {
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
			if (!(await verifyRequest(req, res))) {
				return;
			}

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
			const filename = file.originalFilename;

			if (!filename) {
				throw new Error('Invalid filename');
			}

			const url = `${IMAGE_DIRECTORY}/${data.id}/${filename}`;

			await fs.copyFile(file.filepath, url);
			await fs.rm(file.filepath);

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

const verifyRequest = async (
	req: http.IncomingMessage,
	res: http.ServerResponse<http.IncomingMessage> & {
		req: http.IncomingMessage;
	}
) => {
	const cookies = parseCookies(req);

	if (!cookies['next-auth.session-token']) {
		if (!cookies['__Secure-next-auth.session-token']) {
			logger.error('Missing token');
			res.writeHead(400, {
				'Content-Type': 'text/plain',
			});
			res.end('Missing token');
			return false;
		}
	}

	// Verify auth token
	const session = await verifyAccessToken(
		cookies['next-auth.session-token'] ||
			cookies['__Secure-next-auth.session-token']
	);

	if (!session) {
		logger.error('Invalid token');
		res.writeHead(401, {
			'Content-Type': 'text/plain',
		});
		res.end('Invalid token');
		return false;
	}

	if (session.expires < new Date()) {
		logger.error('Token expired');
		res.writeHead(401, {
			'Content-Type': 'text/plain',
		});
		res.end('Token expired');
		return false;
	}

	logger.debug('Token verified');
	return true;
};

export const testImageRequest = (path: string) => {
	// Check REGEX to make sure the path is valid
	if (
		!/^\/images\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\.(jpg|jpeg|png|gif)$/g.test(
			path
		)
	) {
		throw new Error('Invalid path');
	}

	return true;
};
