import { authOptions } from '@/server/auth';
import {
	type NextApiRequest,
	type GetServerSidePropsContext,
	type NextApiResponse,
} from 'next';
import { getServerSession } from 'next-auth';

export const ntpProtectedRoute = async (context: GetServerSidePropsContext) => {
	const session = await getServerSession(context.req, context.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		};
	}

	if (session.user.ntpAuthenticated === false) {
		return {
			redirect: {
				destination: '/auth/profile/ntp',
				permanent: false,
			},
		};
	}

	return {
		props: {
			session,
		},
	};
};

export const ntpProtectedApiRoute = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const session = await getServerSession(req, res, authOptions);

	if (!session || !session.user.ntpAuthenticated) {
		return false;
	}

	return true;
};
