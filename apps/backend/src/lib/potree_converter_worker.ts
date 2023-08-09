import { potreeConverter } from './potree_converter';
import { logger } from '../utils/logger';
import { parentPort, workerData } from 'node:worker_threads';

const { input, output } = workerData;

(async () => {
	try {
		parentPort?.postMessage(await potreeConverter(input, output));
	} catch (err) {
		logger.error(err);
		parentPort?.postMessage({ error: err });
	}
})();
