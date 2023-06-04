"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpload = void 0;
const fs_1 = require("fs");
const logger_1 = require("../../utils/logger");
const IMAGE_DIRECTORY = '.\\images';
const handleUpload = async (data, callback) => {
    switch (data.uploadType) {
        case 'framepos':
            return logger_1.logger.warn('Framepos deprecated');
        case 'survey':
        case 'comparison':
            const image_urls = [];
            try {
                await fs_1.promises.mkdir(`${IMAGE_DIRECTORY}\\${data.id}`, {
                    recursive: true,
                });
            }
            catch (err) {
                logger_1.logger.error(`Error creating directory ${data.id}`);
                logger_1.logger.error(err);
            }
            for (const file of data.files) {
                try {
                    const url = `${IMAGE_DIRECTORY}\\${data.id}\\${file.name}`;
                    await fs_1.promises.writeFile(url, file.buffer);
                    image_urls.push({
                        image_name: file.name,
                        image_url: url,
                    });
                    logger_1.logger.debug(`Saved ${file.name}`);
                }
                catch (err) {
                    logger_1.logger.error(`Error saving ${file.name}`);
                    logger_1.logger.error(err);
                    image_urls.push({
                        image_name: file.name,
                    });
                }
            }
            return callback(image_urls);
    }
};
exports.handleUpload = handleUpload;
