import { Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import { searchPanoramas } from './street_view';

// Row data from framepos.txt
type FramePosResult = {
	frame_index: number;
	lat: number;
	lon: number;
	pano_id: string;
};

// Data received from client
type UploadData = {
	uploadType: 'framepos' | 'survey' | 'comparison';
	files: Buffer[];
};

// Data sent to client
type CallbackData = FramePosResult[] | null;

export const handleUpload = async (
	data: UploadData,
	callback: (data: CallbackData) => void
) => {
	switch (data.uploadType) {
		case 'framepos':
			if (data.files.length === 1) {
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

						console.log(result[0]);

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
				return callback(pano_ids);
			}
			return;
		case 'survey':
			return logger.warn('Unimplemented');
		case 'comparison':
			return logger.warn('Unimplemented');
	}
};
