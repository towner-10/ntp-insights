import { type GetServerSidePropsContext } from 'next';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth';

export default function Home() {
	return <></>;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerSession(context.req, context.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: '/auth/signin',
				permanent: false,
			},
		};
	}

	return {
		redirect: {
			destination: '/home',
			permanent: false,
		},
		props: {
			session,
		},
	};
}
