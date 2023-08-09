import fs from 'fs/promises';
import { spawn } from 'child_process';
import { logger } from '../utils/logger';
import formidable from 'formidable';
import { newScan, setScanStatus, updateScanLocation } from '../db';
import { ScanType } from 'database';
import { Worker } from 'node:worker_threads';
import path from 'path';

const isWindows = process.platform === 'win32';

type PointCloudJobData = {
	user_id: string;
	folder_name?: string;
	file: formidable.File;
	scan_type: ScanType;
};

type PointCloudJob = PointCloudJobData & {
	scan_id: string;
	worker: Worker;
};

const workers: PointCloudJob[] = [];

export const handlePointCloudUpload = async ({
	user_id,
	folder_name,
	file,
	scan_type,
}: PointCloudJobData) => {
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

		// Add to queue
		const worker = new Worker(
			path.resolve(
				__dirname,
				process.env.NODE_ENV === 'production'
					? './potree_converter_worker.js'
					: './potree_converter_worker.ts'
			),
			{
				workerData: {
					input: file_path,
					output: `./pointclouds/${folder_name ?? scan_id}/output`,
				},
			}
		);

		worker.on('message', (result) => {
			(async () => {
				try {
					try {
						await fs.rm(file_path);
					} catch (err) {
						logger.error(`Error deleting file ${file_path}`);
						logger.error(err);
					}

					if (result !== 0 || typeof result !== 'number') {
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
					logger.error(err);
				} finally {
					// Remove from queue
					const index = workers.findIndex(
						(worker) => worker.scan_id === scan_id
					);

					worker.terminate();

					if (index !== -1) {
						workers.splice(index, 1);
					}
				}
			})();
		});

		workers.push({
			user_id,
			folder_name,
			file,
			scan_type,
			scan_id,
			worker,
		});
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
