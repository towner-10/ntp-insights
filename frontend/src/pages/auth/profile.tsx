import Header from '@/components/header';
import { SearchesDataTable } from '@/components/searches-datatable';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { authOptions } from '@/server/auth';
import { api } from '@/utils/api';
import { type GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import Head from 'next/head';

export default function ProfilePage() {
	const session = useSession();

	if (!session.data?.user) {
		return <div>Loading...</div>;
	}

	const searches = api.search.getUpdatedBy.useQuery({
		id: session.data.user.id || '',
	});

	return (
		<>
			<Head>
				<title>Profile</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="h-screen">
				<Header title="Profile" session={session.data} />
				<Toaster />
				<div className="container p-6">
					<Card>
						<CardHeader>
							<CardTitle>Your searches</CardTitle>
							<CardDescription>
								These are the searches you have made.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<SearchesDataTable searches={searches.data ?? []} />
						</CardContent>
					</Card>
				</div>
			</main>
		</>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerSession(context.req, context.res, authOptions);

	if (!session) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		};
	}

	return {
		props: {
			session,
		},
	};
}
