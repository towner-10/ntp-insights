import { logger } from './utils/logger';

type Job = {
	interval: NodeJS.Timer;
	nextRun: Date | null;
	onOverrun: () => void | Promise<void>;
};

/**
 * Scheduler class to manage CRON jobs
 */
export default class Scheduler {
	private jobs: Map<string, Job> = new Map();
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
	 * @param onOverrun Callback function to run when the job has overrun
	 * @param runImmediately Whether to run the job immediately
	 */
	public addJob(
		hash: string,
		start: Date,
		end: Date,
		frequency: number,
		callback: () => void | Promise<void>,
		onOverrun: () => void | Promise<void>,
		runImmediately = false
	) {
		// Ensure start date is before end date
		if (start.getTime() > end.getTime()) {
			throw new Error('❌ Start date must be before end date');
		}

		// If start date is in the past, set it to now
		if (start.getTime() < Date.now()) start = new Date();

		// Convert the frequency to CRON format
		if (frequency < 6)
			throw new Error('❌ Frequency must be greater than or equal to 6');

		const frequencyMs = frequency * 60 * 60 * 1000;

		if (frequencyMs > Math.pow(2, 32 - 1) - 1)
			throw new Error('❌ Frequency too large');

		// If the job should be run immediately, run it
		if (runImmediately) {
			void (async () => {
				await callback();
			})();
		}

		// Add a new job to the scheduler
		this.jobs.set(hash, {
			interval: setInterval(async () => {
				await callback();

				// Check if the next run should be set
				if (Date.now() + frequencyMs < end.getTime()) {
					this.setNextRun(hash, new Date(Date.now() + frequencyMs));
				} else {
					this.setNextRun(hash, null);
				}
			}, frequency * 60 * 60 * 1000),
			nextRun:
				Date.now() + frequencyMs < end.getTime()
					? new Date(Date.now() + frequencyMs)
					: null,
			onOverrun: onOverrun,
		});

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
		clearInterval(this.jobs.get(hash)?.interval);
		this.jobs.delete(hash);

		logger.success(`Removed job with id: ${hash}`);
	}

	private setNextRun(hash: string, nextRun: Date | null) {
		const job = this.jobs.get(hash);
		if (!job) return;
		job.nextRun = nextRun;
	}

	public getNextRun(hash: string) {
		const job = this.jobs.get(hash);
		if (!job) return null;
		return job.nextRun;
	}

	/**
	 * Check for overruns in the scheduler
	 */
	public checkOverruns() {
		this.jobs.forEach((job, id) => {
			if (!job.nextRun) {
				logger.warn(`Job with id: ${id} has overrun`);
				job.onOverrun();
				this.removeJob(id);
			}
		});
	}

	/**
	 * Stop the scheduler
	 */
	public stop() {
		clearInterval(this.updateLoop);
		for (const hash of this.jobs.keys()) this.removeJob(hash);
	}

	/**
	 * Get the number of jobs in the scheduler
	 */
	public get jobsLength() {
		return this.jobs.size;
	}
}
