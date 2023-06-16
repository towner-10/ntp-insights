import { PropsWithChildren, type ReactNode } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { cn } from '@/lib/utils';

type Props = {
	title: string;
	description: string;
	className?: string;
};

export default function StatCard(props: PropsWithChildren<Props>) {
	return (
		<Card className={cn(props.className)}>
			<CardHeader>
				<CardTitle>{props.title}</CardTitle>
				<CardDescription>{props.description}</CardDescription>
			</CardHeader>
			<CardContent>{props.children}</CardContent>
		</Card>
	);
}
