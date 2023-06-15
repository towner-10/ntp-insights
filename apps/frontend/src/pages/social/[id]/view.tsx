import { useRouter } from 'next/router';
import { type GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Header from '@/components/header';
import { DownloadButton } from '@/components/buttons/download-button';
import { CalendarDateRangePicker } from '@/components/ui/calendar-range';
import ExampleGraph from '@/components/examples/example-graph';
import ExampleStatCard from '@/components/examples/example-stat-card';
import { MapCard, SearchViewBox } from '@/components/maps';
import ServerStatusBadge from '@/components/server-status-badge';
import 'mapbox-gl/dist/mapbox-gl.css';
import { addDays } from 'date-fns';
import { Toaster } from '@/components/ui/toaster';
import { api } from '@/utils/api';
import { ntpProtectedRoute } from '@/lib/protectedRoute';
import { useSession } from 'next-auth/react';

const ViewSearchPage = () => {
	const session = useSession();
	const router = useRouter();
	const {
		id,
	}: {
		id?: string;
	} = router.query;

	const search = api.search.get.useQuery({ id: id || '' });

	if (search.isLoading) {
		return <div>Loading...</div>;
	} else if (search.isError) {
		return <div>Error: {search.error.message}</div>;
	} else if (!search.data) {
		return <div>Not found</div>;
	}

	return (
		<>
			<Head>
				<title>{`${search.data?.name || 'View Search'}`}</title>
				<meta name="description" content="Generated by create-t3-app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="h-screen">
				<Header
					title={`${search.data?.name || 'View Search'}`}
					session={session.data}
				/>
				<Toaster />
				<div className="container flex flex-col items-center justify-center p-6">
					<div className="flex w-full flex-row items-center">
						<div className="flex flex-row items-center gap-4">
							<DownloadButton />
							<CalendarDateRangePicker
								value={{
									from: search.data?.start_date || new Date(),
									to: search.data?.end_date || addDays(new Date(), 7),
								}}
							/>
							<ServerStatusBadge />
						</div>
					</div>
					<div className="grid w-full grid-cols-1 gap-4 py-8 lg:grid-cols-5">
						<MapCard
							title="Overview"
							description="Map of search area. View posts by clicking on the markers."
							className="min-w-[400px] md:col-span-4 md:row-span-4"
							start={{
								lng: search.data.longitude,
								lat: search.data.latitude,
							}}
							boxes={search.data.results
								.map((result) => {
									return result.location.map((location) => {
										return {
											id: location['id'],
											geo: location['geo'],
											country: location['country'],
											full_name: location['full_name'],
											country_code: location['country_code'],
										} as SearchViewBox;
									});
								})
								.flat()
								.filter(
									(box, index, self) =>
										self.findIndex((b) => b.id === box.id) === index
								)}
						/>
						<ExampleStatCard
							title="Total Results"
							description="Total number of results"
							value={
								<h2 className="text-4xl font-bold">
									{search.data?._count.results}
								</h2>
							}
						/>
						<ExampleStatCard
							title="User Growth"
							description="Total number of users"
							value={<h2 className="text-success text-4xl font-bold">+50</h2>}
						/>
						<ExampleStatCard
							title="Total Users"
							description="Total number of users"
							value={<h2 className="text-4xl font-bold">100</h2>}
						/>
						<ExampleStatCard
							title="Total Users"
							description="Total number of users"
							value={<h2 className="text-4xl font-bold">100</h2>}
						/>
						<ExampleGraph className="md:col-span-5" />
						<ExampleGraph className="md:col-span-5" />
					</div>
				</div>
			</main>
		</>
	);
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
	return await ntpProtectedRoute(context);
}

export default ViewSearchPage;
