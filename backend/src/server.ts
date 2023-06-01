import http from 'http';
import { Server } from 'socket.io';
import { logger } from './utils/logger';
import { searchPanoramas } from './lib/street_view';

type UploadData = {
	uploadType: 'framepos' | 'survey' | 'comparison';
	files: Buffer[];
};

type FramePosResult = {
	frame_index: number;
	lat: number;
	lon: number;
	pano_id: string;
};

export default class NTPServer {
	private static instance: NTPServer;
	private httpServer: http.Server;
	private wss: Server;
	private eventMap: { [key: string]: () => Promise<void> };

	private constructor() {
		this.httpServer = http.createServer();
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

			socket.on(
				'upload',
				async (
					data: UploadData,
					callback: (data: FramePosResult[]) => void
				) => {
					if (
						data.uploadType === 'framepos' &&
						data.files.length === 1
					) {
						logger.debug('Received framepos file');

						const framepos_text = data.files[0].toString('utf-8');
						const pano_ids = [];
						const framepos = framepos_text.split('\n');

						framepos.shift();

						for (const line of framepos) {
							const columns = line.split(',');
							const frame_index = columns[1];
							const lat = columns[2];
							const lon = columns[3];

							if (!lat || !lon) continue;

							try {
								const result = await searchPanoramas(
									parseFloat(lat),
									parseFloat(lon)
								);

								pano_ids.push({
									frame_index: parseInt(frame_index),
									lat: parseFloat(lat),
									lon: parseFloat(lon),
									pano_id: result[0].pano_id,
								});
							} catch (err) {
								logger.error(`Error searching for ${frame_index}`);
								logger.error(err);
							}
						}

						logger.debug('Sending framepos results');

						callback(pano_ids);
					}
				}
			);

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
