import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import NTPServer from '../server';
import { expect, test } from '@jest/globals';

describe('API Upload', () => {
	beforeAll(() => {
		NTPServer.getInstance();
	});

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

	afterAll(() => {
		NTPServer.getInstance().getWebServer().close();
	});
});
