import Header from '@/components/header';
import { StaticMap } from '@/components/map';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/toaster';
import { authOptions } from '@/server/auth';
import { api } from '@/utils/api';
import { type GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

export default function ProfilePage() {
	const loadingCards = new Array<number>(6);
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
				<div className="container flex flex-col items-center justify-center p-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center gap-6">
						{searches.isLoading && (
							[...loadingCards].map((_, i) => (
								<Skeleton key={i} className='rounded-lg w-full h-4' />
							))
						)}
						{searches.isError && <div>Error: {searches.error.message}</div>}
						{searches.data?.length === 0 && (
							<div className="flex flex-col h-full w-full items-center justify-center col-span-3 row-span-full">
								<p className="text-2xl font-bold">No searches found...</p>
							</div>
						)}
						{searches.data?.sort((a, b) => {
							return b.created_at.getTime() - a.created_at.getTime();
						}).map((search) => (
							<Card key={search.id}>
								<CardHeader>
									<CardTitle>
										<Link className='underline' href={`/search/${search.id}/view`}>
											{search.name}
										</Link>
									</CardTitle>
									<CardDescription>
										Created on: {search.created_at.toDateString()}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<StaticMap
										className='h-[200px] mb-4'
										lat={Number(search.location.split(",")[0])}
										lng={Number(search.location.split(",")[1])} />
									<p>Frequency: <span className='font-bold'>{search.frequency}</span> min</p>
									<p>Keywords: <span className='font-bold'>{search.keywords.map((keyword) => {
										return keyword + ', ';
									})}</span></p>
									<p>Facebook: <span className='font-bold'>{search.facebook ? 'True' : 'False'}</span></p>
									<p>Instant Weather: <span className='font-bold'>{search.instant_weather ? 'True' : 'False'}</span></p>
								</CardContent>
								<CardFooter>
									<div className="flex justify-end">
										<div className="flex flex-row items-center gap-2">
											<Avatar>
												<AvatarImage
													src={search.created_by.image || ''}
													alt={search.created_by.name || ''}
												/>
												<AvatarFallback>
													{search.created_by.name?.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<p>
												Created by{' '}
												<span className="font-bold">
													{search.created_by.name}
												</span>
											</p>
										</div>
									</div>
								</CardFooter>
							</Card>
						))}
					</div>
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
