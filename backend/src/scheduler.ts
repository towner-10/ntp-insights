import Cron from 'croner';
import { logger } from './utils/logger';

/**
 * Scheduler class to manage CRON jobs
 */
export default class Scheduler {
	private jobs: Map<string, Cron> = new Map();
	private updateLoop: NodeJS.Timeout;

	/**
	 * @param updateFrequency Frequency in milliseconds to check for overruns
	 */
	public constructor(updateFrequency: number) {
		this.updateLoop = setInterval(async () => {
			this.checkOverruns();
		}, updateFrequency);
	}

	/**
	 * Add a new job to the scheduler
	 * @param hash Unique identifier for the job
	 * @param start Start date of the job
	 * @param end End date of the job
	 * @param frequency Frequency of the job in minutes
	 * @param callback Callback function to run when the job is executed
	 */
	public addJob(
		hash: string,
		start: Date,
		end: Date,
		frequency: number,
		callback: () => void | Promise<void>,
		runImmediately = false
	) {
		// Ensure start date is before end date
		if (start.getTime() > end.getTime()) {
			throw new Error('❌ Start date must be before end date');
		}

		// If start date is in the past, set it to now
		if (start.getTime() < Date.now()) start = new Date();

		// Convert the frequency to CRON format
		if (frequency < 1)
			throw new Error('❌ Frequency must be greater than or equal to 1');
		const frequencyCron = `? */${frequency} * * * *`;

		// Add a new job to the scheduler
		this.jobs.set(
			hash,
			new Cron(
				frequencyCron,
				{
					maxRuns: Infinity,
					startAt: start,
					stopAt: end,
					protect: true,
					interval: frequency * 60, // Convert from minutes to seconds
				},
				callback
			)
		);

		// If the job should be run immediately, run it
		if (runImmediately) this.jobs.get(hash)?.trigger();

		logger.success(`Added job with id: ${hash}`);
	}

	/**
	 * Remove a job from the scheduler
	 * @param hash Unique identifier for the job
	 */
	public removeJob(hash: string) {
		// If the job doesn't exist, throw an error
		if (!this.jobs.has(hash)) throw new Error('❌ Job does not exist');

		// Remove the job from the scheduler
		this.jobs.get(hash)?.stop();
		this.jobs.delete(hash);

		logger.success(`Removed job with id: ${hash}`);
	}

	public checkOverruns() {
		this.jobs.forEach((job, id) => {
			if (!job.msToNext()) {
				logger.warn(`Job with id: ${id} has overrun`);
				this.removeJob(id);
			}
		});
	}

	public stop() {
		clearInterval(this.updateLoop);
		this.jobs.forEach((job) => job.stop());
	}

	/**
	 * Get the number of jobs in the scheduler
	 */
	public get jobsLength() {
		return this.jobs.size;
	}
}
