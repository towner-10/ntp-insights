import { type GetServerSidePropsContext } from 'next';
import {
	getServerSession,
	type NextAuthOptions,
	type DefaultSession,
} from 'next-auth';
import { renderEmail } from '@/components/emails/verify-email';
import sendgrid from '@sendgrid/mail';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/server/db';
import DiscordProvider from 'next-auth/providers/discord';
import EmailProvider from 'next-auth/providers/email';
import { env } from '@/env.mjs';

sendgrid.setApiKey(env.SENDGRID_API_KEY);

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
	interface User {
		ntpAuthenticated: boolean;
	}

	interface Session extends DefaultSession {
		user: User & DefaultSession['user'];
	}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	callbacks: {
		session({ session, user }) {
			if (session.user) {
				session.user.id = user.id;
				session.user.ntpAuthenticated = !!user?.ntpAuthenticated;
			}
			return session;
		},
	},
	adapter: PrismaAdapter(prisma),
	session: {
		strategy: 'database',
	},
	pages: {
		signIn: '/auth/signin',
		newUser: '/auth/profile/settings',
	},
	providers: [
		DiscordProvider({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
		}),
		EmailProvider({
			from: env.EMAIL_FROM,
			sendVerificationRequest: async ({ identifier: email, url, provider }) => {
				const { host } = new URL(url);

				const emailHtml = await renderEmail({
					recipient: email,
					url,
					host,
				});

				const response = await sendgrid.send({
					to: email,
					from: provider.from || env.EMAIL_FROM,
					subject: 'Verify your email',
					html: emailHtml,
				});

				if (response[0].statusCode !== 202) {
					throw new Error('Failed to send email');
				}
			},
		}),
	],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
	req: GetServerSidePropsContext['req'];
	res: GetServerSidePropsContext['res'];
}) => {
	return getServerSession(ctx.req, ctx.res, authOptions);
};
