import { type ReactNode } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';

type Props = {
	title: string;
	description: string;
	value: ReactNode;
};

export default function ExampleStatCard(props: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				<CardDescription>{props.description}</CardDescription>
			</CardHeader>
			<CardContent>{props.value}</CardContent>
		</Card>
	);
}
