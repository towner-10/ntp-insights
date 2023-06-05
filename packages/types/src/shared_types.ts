export type ImageResult = {
	image_name: string;
	image_url?: string;
};

// Data received from client
export type UploadData = {
	uploadType: 'survey' | 'comparison';
	id?: string;
	files: {
		name: string;
		buffer: File | Buffer;
	}[];
};

// Data sent to client
export type CallbackData = ImageResult[] | null;
