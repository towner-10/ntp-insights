import _ from 'lodash';
import { logger } from '../../utils/logger';

export type Panorama = {
	pano_id: string;
	lat: number;
	lng: number;
	heading: number;
	pitch: number;
	roll: number;
	date: string | null;
};

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
	if (!blob) return [];

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

		const dates = raw_dates.map((date: any) => {
			return `${date[1][0]}-${pad(date[1][1], 2)}`;
		});

		return raw_panos.map((pano: any, index: number) => {
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
		logger.error(e);
		return [];
	}
}

export async function searchPanoramas(lat: number, lng: number) {
	const response = await searchRequest(lat, lng);
	return extractPanoramas(await response.text());
}
