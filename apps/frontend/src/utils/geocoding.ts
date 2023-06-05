import { env } from '@/env.mjs';
import NodeGeocoder from 'node-geocoder';

const geocoder = NodeGeocoder({
	provider: 'mapbox',
	apiKey: env.NEXT_PUBLIC_MAPBOX_TOKEN,
});

type StateCode = {
	[key: string]: string | null;
};

export const stateCodes: StateCode = {
	'Newfoundland and Labrador': 'NL',
	'Prince Edward Island': 'PE',
	'Nova Scotia': 'NS',
	'New Brunswick': 'NB',
	Quebec: 'QC',
	Ontario: 'ON',
	Manitoba: 'MB',
	Saskatchewan: 'SK',
	Alberta: 'AB',
	'British Columbia': 'BC',
	'Yukon Territory': 'YT',
	'Northwest Territories': 'NT',
	Nunavut: 'NU',
	None: null,
};

export const findLocation = async ({
	lng,
	lat,
}: {
	lng: number;
	lat: number;
}) => {
	const response = await geocoder.reverse({
		lat: lat,
		lon: lng,
	});

	return response[0];
};
