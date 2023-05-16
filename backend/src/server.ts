import { Server, createServer } from 'http';
import { WebSocketServer } from 'ws';
import { logger } from './utils/logger';

export default class NTPServer {
	private static instance: NTPServer;
	private server: Server;
	private wss: WebSocketServer;
	private eventMap: { [key: string]: () => Promise<void> };

	private constructor() {
		this.server = createServer();
		this.wss = new WebSocketServer({ server: this.server });

		this.eventMap = {};

		this.wss.on('connection', (ws, req) => {
			const ip = req.socket.remoteAddress;

			ws.on('message', async (message: string) => {
				await this.callEvent(message);
			});

			ws.on('error', (err) => {
				logger.error(`Error in WebSocket: ${err}`);
			});

			logger.debug(`New WebSocket connection via: ${ip}`);
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

	public getServer() {
		return this.server;
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
