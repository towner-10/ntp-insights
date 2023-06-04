import { expect, test } from '@jest/globals';
import Scheduler from '../scheduler';

const scheduler = new Scheduler(1000);

test('addJob() should add a new job to the scheduler', () => {
	scheduler.addJob(
		'test',
		new Date(),
		new Date(),
		1,
		() => {},
		() => {}
	);
	expect(scheduler.jobsLength).toBe(1);
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
			1,
			() => {},
			() => {}
		);
	}).toThrow();
});

test('addJob() frequency validation should throw an error if frequency is less than 1', () => {
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
		1,
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
