import { type GetServerSidePropsContext, type NextPage } from 'next';
import Head from 'next/head';
import Header from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { ntpProtectedRoute } from '@/lib/protectedRoute';
import { useSession } from 'next-auth/react';
import { View360 } from '@/components/view-360';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

const Example: NextPage = () => {
	const session = useSession();

	return (
		<>
			<Head>
				<title>NTP 360</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="h-screen">
				<Header
					title={
						<>
							NTP <span className="text-success">360</span>
						</>
					}
					session={session.data}
				/>
				<Toaster />
				<div className="container flex flex-col items-center justify-center p-6">
					<h2 className="mb-4 w-full text-left text-2xl font-medium">
						NTP 2023 Storm Event
					</h2>
					<div className="grid w-full grid-cols-1 lg:grid-cols-5 lg:grid-rows-3 gap-4">
						<div className="relative h-full xl:h-[1000px] col-span-4 row-span-3 overflow-hidden rounded-md">
							<View360 />
						</div>
						<Card className='row-span-2'>
							<CardHeader>
								<CardTitle>Details</CardTitle>
								<CardDescription>About the current 360 view.</CardDescription>
								<CardContent>Lng/Lat: 43.00635552433941, -81.27503295743084</CardContent>
							</CardHeader>
						</Card>
					</div>
				</div>
			</main>
		</>
	);
};

export default Example;

export async function getServerSideProps(context: GetServerSidePropsContext) {
	return await ntpProtectedRoute(context);
}
