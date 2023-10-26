export { default } from 'next-auth/middleware';

export const config = {
	pages: [
		'/',
		'/social/:path*',
		'/360/dashboard',
		'/lidar/dashboard',
		'/auth/profile/:path*',
	],
};
