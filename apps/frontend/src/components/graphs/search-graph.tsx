import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { cn } from '@/lib/utils';
import { Post } from 'database';

type DataType = {
	label: string;
	stat: number;
};

export function SearchGraph(props: {
	title: string;
	description: string;
	data: DataType[];
	className?: string;
}) {
	return (
		<Card className={cn(props.className)}>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				<CardDescription>{props.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={200}>
					<AreaChart
						data={props.data}
						margin={{
							top: 10,
							right: 30,
							left: 0,
							bottom: 0,
						}}
					>
						<XAxis dataKey="label" />
						<YAxis />
						<Tooltip
							allowEscapeViewBox={{ x: true, y: false }}
							contentStyle={{ backgroundColor: '', color: '' }}
							wrapperClassName="rounded-lg text-foreground bg-background/80 backdrop-blur-md"
							labelClassName="font-bold text-lg pb-2 text-foreground"
						/>
						<Area
							type="monotone"
							dataKey="stat"
							stroke="#8884d8"
							fill="#8884d8"
							name="Posts"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

export function ClassificationComparisonGraph(props: {
	title: string;
	description: string;
	data: {
		label: string;
		relevant: number;
		irrelevant: number;
	}[];
	className?: string;
}) {
	return (
		<Card className={cn(props.className)}>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				<CardDescription>{props.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={200}>
					<AreaChart
						data={props.data}
						margin={{
							top: 10,
							right: 30,
							left: 0,
							bottom: 0,
						}}
					>
						<XAxis dataKey="label" />
						<YAxis />
						<Tooltip
							allowEscapeViewBox={{ x: true, y: false }}
							contentStyle={{ backgroundColor: '', color: '' }}
							wrapperClassName="rounded-lg text-foreground bg-background/80 backdrop-blur-md"
							labelClassName="font-bold text-lg pb-2 text-foreground"
						/>
						<Area
							type="monotone"
							dataKey="relevant"
							stroke="#8884d8"
							fill="#8884d8"
							name='Relevant'
						/>
						<Area
							type="monotone"
							dataKey="irrelevant"
							stroke="#82ca9d"
							fill="#82ca9d"
							name='Irrelevant'
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

export function breakPostsIntoIntervals(posts: Post[], interval: number) {
	const intervals: Post[][] = [];
	let pivot = posts[0].created_at;
	let intervalPosts: Post[] = [];

	posts.forEach((post) => {
		if (
			new Date(post.created_at).getTime() - new Date(pivot).getTime() >
			interval
		) {
			intervals.push(intervalPosts);
			intervalPosts = [];
			pivot = post.created_at;
		}
		intervalPosts.push(post);
	});

	intervals.push(intervalPosts);

	return intervals;
}
