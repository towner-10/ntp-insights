import http from 'http';
import { promises as fs } from 'fs';
import { Server } from 'socket.io';
import { logger } from './utils/logger';
import { handleUpload } from './lib/upload/manager';

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

			socket.on('upload', handleUpload);

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
