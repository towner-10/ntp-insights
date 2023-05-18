import { authOptions } from "@/server/auth";
import { type GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";

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
