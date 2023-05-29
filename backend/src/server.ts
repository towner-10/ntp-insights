import http from 'http';
import { Server } from 'socket.io';
import { logger } from './utils/logger';

export default class NTPServer {
	private static instance: NTPServer;
	private httpServer: http.Server;
	private wss: Server;
	private eventMap: { [key: string]: () => Promise<void> };

	private constructor() {
		this.httpServer = http.createServer();
		this.wss = new Server(this.httpServer, {
			cors: {
				origin: '*',
			},
		});
		this.eventMap = {};

		this.wss.on('connection', (socket) => {
			socket.on('message', async (message: string) => {
				await this.callEvent(message);
			});

			socket.on('error', (err) => {
				logger.error(`Error in WebSocket: ${err}`);
			});

			logger.debug(`New WebSocket connection from ${socket.handshake.address.replace('::ffff:', '')}`);
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
