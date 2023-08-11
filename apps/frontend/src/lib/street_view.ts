/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// I am sorry for I have sinned, this is no where close to being typesafe, but it works and I am too lazy to fix it

import type { FrameposResult, Panorama } from '@/utils/types/framepos';
import _ from 'lodash';

function makeSearchURL(lat: number, lng: number) {
	const url = `https://maps.googleapis.com/maps/api/js/GeoPhotoService.SingleImageSearch?pb=!1m5!1sapiv3!5sUS!11m2!1m1!1b0!2m4!1m2!3d${lat}!4d${lng}!2d50!3m10!2m2!1sen!2sGB!9m1!1e2!11m4!1m3!1e2!2b1!3e2!4m10!1e1!1e2!1e3!1e4!1e8!1e6!5m1!1e2!6m1!1e2&callback=callbackfunc`;
	return encodeURI(url);
}

function searchRequest(lat: number, lng: number) {
	const url = makeSearchURL(lat, lng);

	return fetch(url, {
		method: 'GET',
	});
}

function pad(num: number, size: number) {
	let str = num.toString();
	while (str.length < size) str = '0' + str;
	return str;
}

function extractPanoramas(text: string): Panorama[] {
	const blob = [...text.matchAll(/callbackfunc\( (.*) \)$/gm)][0];
	if (!blob || !blob[1]) return [];

	const data = JSON.parse(blob[1]);

	if (
		_.isEqual(data, [[3, 'generic', 'Invalid location']]) ||
		_.isEqual(data, [[5, 'generic', 'Search returned no images.']])
	) {
		return [];
	}

	try {
		const subset = data[1][5][0];

		let raw_panos = subset[3][0];
		let raw_dates = [];

		if (subset.length < 9 || !subset[8]) {
			raw_dates = [];
		} else {
			raw_dates = subset[8];
		}

		raw_panos = raw_panos.reverse();
		raw_dates = raw_dates.reverse();

		const dates = raw_dates.map((date: never) => {
			return `${date[1][0]}-${pad(date[1][1], 2)}`;
		});

		return raw_panos.map((pano: never, index: number) => {
			if (pano[0][1] === undefined) throw new Error('Invalid panorama');

			return {
				pano_id: pano[0][1],
				lat: pano[2][0][2],
				lng: pano[2][0][3],
				heading: pano[2][2][0],
				pitch: pano[2][2][1],
				roll: pano[2][2][2],
				date: index < dates.length ? dates[index] : null,
			};
		});
	} catch (e) {
		console.error(e);
		return [];
	}
}

export async function searchPanoramas(lat: number, lng: number) {
	const response = await searchRequest(lat, lng);
	return extractPanoramas(await response.text());
}

export async function processFramepos(input: {
	path_id: string;
	framepos: string;
	onProgress?: (progress: number) => void;
}) {
	const images: FrameposResult[] = [];
	const framepos = input.framepos.split('\n');

	framepos.shift();

	// Remove the last element if it is empty
	if (
		framepos[framepos.length - 1] === '' ||
		framepos[framepos.length - 1] === '\r'
	)
		framepos.pop();

	for (const line of framepos) {
		try {
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

			// Ensure that there is a lat and lon value, otherwise skip since it is invalid
			if (!lat || !lon) throw new Error(`Invalid framepos in: ${line}`);

			const result = await searchPanoramas(parseFloat(lat), parseFloat(lon));

			images.push({
				frame_index: parseInt(frame_index || '0'),
				lat: parseFloat(lat),
				lng: parseFloat(lon),
				altitude: parseFloat(alt || '0'),
				distance: parseFloat(distance || '0'),
				heading: parseFloat(heading || '0'),
				pitch: parseFloat(pitch || '0'),
				roll: parseFloat(roll || '0'),
				track: parseFloat(track || '0'),
				file_name: file_name,
				google_image: result[0],
			} as FrameposResult);

			if (input.onProgress) {
				input.onProgress(images.length / framepos.length);
			}
		} catch (err) {
			console.error(err);
		}
	}

	return images;
}
