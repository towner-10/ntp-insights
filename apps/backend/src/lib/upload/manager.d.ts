/// <reference types="node" />
type ImageResult = {
    image_name: string;
    image_url?: string;
};
type UploadData = {
    uploadType: 'framepos' | 'survey' | 'comparison';
    id?: string;
    files: {
        name: string;
        buffer: Buffer;
    }[];
};
type CallbackData = ImageResult[] | null;
export declare const handleUpload: (data: UploadData, callback: (data: CallbackData) => void) => Promise<void>;
export {};
//# sourceMappingURL=manager.d.ts.map