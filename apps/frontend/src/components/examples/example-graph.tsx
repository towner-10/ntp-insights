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

const data = [
	{
		name: 'Jan',
		uv: 4000,
		pv: 2400,
		amt: 2400,
	},
	{
		name: 'Fed',
		uv: 3000,
		pv: 1398,
		amt: 2210,
	},
	{
		name: 'Mar',
		uv: 2000,
		pv: 9800,
		amt: 2290,
	},
	{
		name: 'Apr',
		uv: 2780,
		pv: 3908,
		amt: 2000,
	},
	{
		name: 'May',
		uv: 1890,
		pv: 4800,
		amt: 2181,
	},
	{
		name: 'Jun',
		uv: 2390,
		pv: 3800,
		amt: 2500,
	},
	{
		name: 'Jul',
		uv: 3490,
		pv: 4300,
		amt: 2100,
	},
];

type Props = {
	className?: string;
};

export default function ExampleGraph(props: Props) {
	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>Posts Processed</CardTitle>
				<CardDescription>
					Total posts every month that have been analyzed.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={200}>
					<AreaChart
						data={data}
						margin={{
							top: 10,
							right: 30,
							left: 0,
							bottom: 0,
						}}
					>
						<XAxis dataKey="name" />
						<YAxis />
						<Tooltip
							allowEscapeViewBox={{ x: true, y: false }}
							contentStyle={{ backgroundColor: '', color: '' }}
							wrapperClassName="rounded-lg text-foreground bg-background/80 backdrop-blur-md"
							labelClassName="font-bold text-lg pb-2 text-foreground"
							labelFormatter={(value: string) => {
								return `Month: ${value}`;
							}}
						/>
						<Area
							type="monotone"
							dataKey="uv"
							stroke="#8884d8"
							fill="#8884d8"
						/>
						<Area
							type="monotone"
							dataKey="pv"
							stroke="#82ca9d"
							fill="#82ca9d"
						/>
						<Area
							type="monotone"
							dataKey="amt"
							stroke="#ffc658"
							fill="#ffc658"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
