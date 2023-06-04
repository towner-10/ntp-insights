import '@/styles/globals.css';

import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { api } from '@/utils/api';
import { SocketProvider } from '@/components/socket-context';

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<SessionProvider session={session}>
				<SocketProvider>
					<Component {...pageProps} />
					<Toaster />
				</SocketProvider>
			</SessionProvider>
		</ThemeProvider>
	);
};

export default api.withTRPC(MyApp);
