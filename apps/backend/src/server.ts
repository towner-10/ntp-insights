import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { Server } from 'socket.io';
import { logger } from './utils/logger';
import { handleRequest } from './lib/server_handlers';

export default class NTPServer {
	private static instance: NTPServer;
	private webServer: http.Server | https.Server;
	private wss: Server;
	private eventMap: { [key: string]: () => Promise<void> };

	private constructor() {
		if (process.env.NODE_ENV === 'production')
			this.webServer = https.createServer(
				{
					key: fs.readFileSync(path.join(__dirname,'../ssl/privkey.pem'), 'utf8'),
					cert: fs.readFileSync(path.join(__dirname,'../ssl/cert.pem'), 'utf8'),
					ca: fs.readFileSync(path.join(__dirname,'../ssl/chain.pem'), 'utf8'),
				},
				handleRequest
			);
		else this.webServer = http.createServer(handleRequest);

		this.wss = new Server(this.webServer, {
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

	public getWebServer() {
		return this.webServer;
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
