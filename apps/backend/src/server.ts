import http from 'http';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import { Server } from 'socket.io';
import { logger } from './utils/logger';
import { handleUpload } from './lib/save_images';
import parseCookies from './utils/parseCookies';
import { verifyAccessToken } from './db';

export default class NTPServer {
	private static instance: NTPServer;
	private httpServer: http.Server;
	private wss: Server;
	private eventMap: { [key: string]: () => Promise<void> };

	private constructor() {
		this.httpServer = http.createServer(async (req, res) => {
			// Set CORS headers
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader(
				'Access-Control-Request-Method',
				'OPTIONS, GET, POST'
			);
			res.setHeader(
				'Access-Control-Allow-Headers',
				'Origin, X-Requested-With, Content-Type, Accept'
			);

			if (req.method === 'GET') {
				// Check if the request is for one of the files in the images directory
				if (req.url?.startsWith('/images/')) {
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
				}
			} else if (req.method === 'POST') {
				if (req.url === '/api/upload') {
					const cookies = parseCookies(req);

					if (!cookies['next-auth.session-token']) {
						if (!cookies['__Secure-next-auth.session-token']) {
							logger.error('Missing token');
							res.writeHead(400, {
								'Content-Type': 'text/plain',
							});
							res.end('Missing token');
							return;
						}
					}

					// Verify auth token
					const session = await verifyAccessToken(cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token']);

					if (!session) {
						logger.error('Invalid token');
						res.writeHead(400, {
							'Content-Type': 'text/plain',
						});
						res.end('Invalid token');
						return;
					}

					if (session.expires < new Date()) {
						logger.error('Token expired');
						res.writeHead(400, {
							'Content-Type': 'text/plain',
						});
						res.end('Token expired');
						return;
					}

					const form = formidable({ multiples: true });

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

						const data = {
							id: fields.path_id as string,
							files: files.images as formidable.File[],
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

					return;
				}
			}
		});
		this.wss = new Server(this.httpServer, {
			maxHttpBufferSize: 1e8,
			cors: {
				origin: '*',
			},
		});
		this.eventMap = {};

		this.wss.on('connection', (socket) => {
			const ip = socket.handshake.address;

			socket.on('message', async (message: string) => {
				await this.callEvent(message);
			});

			socket.on('error', (err) => {
				logger.error(`Error in WebSocket: ${err}`);
			});

			socket.on('disconnect', () => {
				logger.debug(
					`WebSocket disconnected: ${ip.replace('::ffff:', '')}`
				);
			});

			logger.debug(
				`New WebSocket connection via: ${ip.replace('::ffff:', '')}`
			);
		});
	}

	public async callEvent(event: string) {
		if (this.eventMap[event]) {
			await this.eventMap[event]();
		}
	}

	public setEventMap(eventMap: { [key: string]: () => Promise<void> }) {
		this.eventMap = eventMap;
	}

	public getHttpServer() {
		return this.httpServer;
	}

	public getWebSocketServer() {
		return this.wss;
	}

	public static getInstance(): NTPServer {
		if (!NTPServer.instance) {
			NTPServer.instance = new NTPServer();
		}

		return NTPServer.instance;
	}
}
