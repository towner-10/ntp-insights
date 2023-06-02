import { logger } from '../../utils/logger';
import { type Panorama, searchPanoramas } from './street_view';

// Row data from framepos.txt
type FramePosResult = {
	frame_index: number;
	lat: number;
	lng: number;
	altitude: number;
	distance: number;
	heading: number;
	pitch: number;
	roll: number;
	track: number;
	file_name: string;
	google_image: Panorama;
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
				const images = [];
				const framepos = framepos_text.split('\n');

				framepos.shift();

				for (const line of framepos) {
					const columns = line.trimEnd().split(',');
					const frame_index = columns[1];
					const lat = columns[2];
					const lon = columns[3];
					const alt = columns[4];
					const distance = columns[5];
					const heading = columns[6];
					const pitch = columns[7];
					const roll = columns[8];
					const track = columns[9];
					const file_name = columns[10];

					if (!lat || !lon) continue;

					try {
						const result = await searchPanoramas(
							parseFloat(lat),
							parseFloat(lon)
						);

						images.push({
							frame_index: parseInt(frame_index),
							lat: parseFloat(lat),
							lng: parseFloat(lon),
							altitude: parseFloat(alt),
							distance: parseFloat(distance),
							heading: parseFloat(heading),
							pitch: parseFloat(pitch),
							roll: parseFloat(roll),
							track: parseFloat(track),
							file_name: file_name,
							google_image: result[0],
						});
					} catch (err) {
						logger.error(`Error searching for ${frame_index}`);
						logger.error(err);
					}
				}

				logger.debug('Sending framepos results');
				return callback(images);
			}
			return;
		case 'survey':
			return logger.warn('Unimplemented');
		case 'comparison':
			return logger.warn('Unimplemented');
	}
};
