import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import NTPServer from '../server';
import { expect, test } from '@jest/globals';
import { logger } from '../utils/logger';

beforeAll(() => {
	NTPServer.getInstance();
});

describe('API Upload', () => {
	test('Verify auth cookies', async () => {
		const response = await fetch('http://localhost:8000/api/upload', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				files: [
					{
						filename: 'test.png',
					},
				],
			}),
		});

		expect(response.status).toBe(400);
	});

	test('Invalid auth cookies', async () => {
		const response = await fetch('http://localhost:8000/api/upload', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: 'next-auth.session-token=null',
			},
			body: JSON.stringify({
				files: [
					{
						filename: 'test.png',
					},
				],
			}),
		});

		expect(response.status).toBe(401);
	});
});

describe('Image Fetch', () => {
	test('Directory Traverse Attack', async () => {
		const response = await fetch(
			'http://localhost:8000/images/../../../../../../etc/passwd'
		);

		expect(response.status).toBe(404);
	});

	test('Invalid image path', async () => {
		const response = await fetch(
			'http://localhost:8000/images/invalid/path.jpg'
		);

		expect(response.status).toBe(404);
	});
});


afterAll(() => {
	NTPServer.getInstance().getWebServer().close();
});
