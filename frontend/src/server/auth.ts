import { type GetServerSidePropsContext } from 'next';
import {
	getServerSession,
	type NextAuthOptions,
	type DefaultSession,
} from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/server/db';
import DiscordProvider from 'next-auth/providers/discord';
import EmailProvider from "next-auth/providers/email";
import { env } from '@/env.mjs';

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
	},
	providers: [
		DiscordProvider({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
		}),
		EmailProvider({
			server: {
				host: env.EMAIL_SERVER,
				port: env.EMAIL_PORT,
				auth: {
					user: env.EMAIL_USERNAME,
					pass: env.EMAIL_PASSWORD,
				}
			},
			from: env.EMAIL_USERNAME
		})
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
