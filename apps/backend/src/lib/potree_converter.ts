import fs from 'fs/promises';
import { spawn } from 'child_process';
import { logger } from '../utils/logger';
import formidable from 'formidable';
import { newScan, setScanStatus, updateScanLocation } from '../db';
import { ScanType } from 'database';

const isWindows = process.platform === 'win32';

export const handlePointCloudUpload = async ({
	user_id,
	folder_name,
	file,
	scan_type,
}: {
	user_id: string;
	folder_name?: string;
	file: formidable.File;
	scan_type: ScanType;
}) => {
	const scan = await newScan({
		user_id: user_id,
		scan_location: file.originalFilename?.split('.')[0] ?? '',
		scan_size: file.size,
		scan_type,
	});

	const scan_id = scan.id;

	try {
		await updateScanLocation({
			scan_id,
			location: folder_name ?? scan_id,
		});

		// Create a temporary file path
		try {
			await fs.mkdir(`./pointclouds/${folder_name ?? scan_id}`, {
				recursive: true,
			});
			await fs.copyFile(
				file.filepath,
				`./pointclouds/${folder_name ?? scan_id}/${
					file.originalFilename
				}`
			);
			await fs.rm(file.filepath);
		} catch (err) {
			logger.error(`Error creating directory ${folder_name ?? scan_id}`);
			logger.error(err);
		}

		const file_path = `./pointclouds/${folder_name ?? scan_id}/${
			file.originalFilename
		}`;

		const status = await potreeConverter(
			file_path,
			`./pointclouds/${folder_name ?? scan_id}`
		);

		try {
			await fs.rm(file_path);
		} catch (err) {
			logger.error(`Error deleting file ${file_path}`);
			logger.error(err);
		}

		if (status !== 0) {
			await setScanStatus({
				scan_id,
				status: 'FAILED',
			});

			throw new Error('PotreeConverter failed');
		} else {
			await setScanStatus({
				scan_id,
				status: 'COMPLETED',
			});
		}
	} catch (err) {
		await setScanStatus({
			scan_id,
			status: 'FAILED',
		});

		throw new Error('Failed to process pointcloud');
	}

	return scan_id;
};

export const potreeConverter = async (input: string, output: string) => {
	const potreeConverterPath = isWindows
		? './potree/PotreeConverter.exe'
		: './potree/PotreeConverter';

	return await new Promise((resolve, reject) => {
		const potreeConverterProcess = spawn(potreeConverterPath, [
			input,
			'-o',
			output,
		]);

		potreeConverterProcess.stderr.on('data', (data) => {
			logger.error(`PotreeConverter error: ${data}`);
			return reject(data);
		});

		potreeConverterProcess.on('exit', (code) => {
			if (code !== 0) {
				logger.error(`PotreeConverter exited with code ${code}`);
				return reject(code);
			}

			logger.success(
				`PotreeConverted ${input} successfully to ${output}`
			);
			return resolve(code);
		});
	});
};
