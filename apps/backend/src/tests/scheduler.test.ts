import { expect, test } from '@jest/globals';
import Scheduler from '../scheduler';
import { logger } from '../utils/logger';

const scheduler = new Scheduler(1000);

test('addJob() should add a new job to the scheduler', () => {
	const now = new Date();

	scheduler.addJob(
		'test',
		now,
		new Date(new Date().setDate(now.getDate() + 7)),
		6,
		() => {},
		() => {}
	);
	expect(scheduler.jobsLength).toBe(1);
});

test('Next run should be in the future', () => {
	const nextRun = scheduler.getNextRun('test');
	logger.debug(nextRun);
	expect(nextRun).not.toBe(null);
	if (nextRun) expect(nextRun.getTime()).toBeGreaterThan(Date.now());
});

test('removeJob() should remove a job from the scheduler', () => {
	scheduler.removeJob('test');
	expect(scheduler.jobsLength).toBe(0);
});

test('addJob() date validation should throw an error if start date is after end date', () => {
	expect(() => {
		scheduler.addJob(
			'test',
			new Date(),
			new Date('2020-01-01'),
			6,
			() => {},
			() => {}
		);
	}).toThrow();
});

test('addJob() frequency validation should throw an error if frequency is less than 6', () => {
	expect(() => {
		scheduler.addJob(
			'test',
			new Date(),
			new Date(),
			0,
			() => {},
			() => {}
		);
	}).toThrow();
});

test('removeJob() should throw an error if the job does not exist', () => {
	expect(() => {
		scheduler.removeJob('test');
	}).toThrow();
});

test('addJob() with check to see if job exists after overrun', async () => {
	scheduler.addJob(
		'test',
		new Date(),
		new Date(),
		6,
		() => {},
		() => {},
		true
	);
	expect(scheduler.jobsLength).toBe(1);
	await new Promise((resolve) => setTimeout(resolve, 2000));
	expect(scheduler.jobsLength).toBe(0);
});

afterAll(() => {
	scheduler.stop();
});
