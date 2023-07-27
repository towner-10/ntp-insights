import { spawn } from 'child_process';
import { logger } from '../utils/logger';

const isWindows = process.platform === 'win32';

export const potreeConverter = async (input: string, output: string) => {
	const potreeConverterPath = isWindows
		? './potree/PotreeConverter.exe'
		: './potree/PotreeConverter';

	await new Promise((resolve, reject) => {
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


            logger.success(`PotreeConverted ${input} successfully to ${output}`);
            return resolve(code);
        });
	});
};
