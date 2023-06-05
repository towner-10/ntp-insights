export type Panorama = {
	pano_id: string;
	lat: number;
	lng: number;
	heading: number;
	pitch: number;
	roll: number;
	date: string | null;
};

export type FrameposResult = {
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