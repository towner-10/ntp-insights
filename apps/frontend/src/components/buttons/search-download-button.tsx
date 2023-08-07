import { LucideDownload } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { api } from '@/utils/api';
import { Search } from 'database';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { FormEvent, useRef } from 'react';
import { Label } from '../ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { CalendarDateRangePicker } from '../ui/calendar-range';
import { DateRange } from 'react-day-picker';
import { useToast } from '../ui/use-toast';

type Inputs = {
	format: 'csv' | 'json';
	date_range: DateRange;
};

export function DownloadButton({ search }: { search: Search }) {
	const formRef = useRef<HTMLFormElement>(null);
	const downloadData = api.searches.download.useMutation();
	const { handleSubmit, control, reset } = useForm<Inputs>();
	const toaster = useToast();

	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void (async () => {
			await handleSubmit((async (data) => {
				const response = await downloadData.mutateAsync({
					id: search.id,
					format: data.format,
					start_date: data.date_range.from,
					end_date: data.date_range.to,
				});

				if (response && data.format === 'csv') {
					const url = window.URL.createObjectURL(
						new Blob([response.toString()], { type: 'text/csv' })
					);
					const link = document.createElement('a');
					link.href = url;
					link.setAttribute('download', `${search.id}.csv`);
					document.body.appendChild(link);
					link.click();
				} else if (response && data.format === 'json') {
					const url = window.URL.createObjectURL(
						new Blob([JSON.stringify(response)], { type: 'application/json' })
					);
					const link = document.createElement('a');
					link.href = url;
					link.setAttribute('download', `${search.id}.json`);
					document.body.appendChild(link);
					link.click();
				} else {
					toaster.toast({
						title: 'Error',
						description: 'An error occurred while downloading the search.',
						duration: 5000,
						variant: 'destructive',
					});
				}
			}) as SubmitHandler<Inputs>)(event);
		})();
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button>
					<LucideDownload className="pr-2" />
					Download
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Download Search</AlertDialogTitle>
					<AlertDialogDescription>
						Download the search in either CSV or JSON format.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<form ref={formRef} onSubmit={onSubmit} className="grid gap-4">
					<div className="flex flex-col gap-2">
						<Label>Format</Label>
						<Controller
							control={control}
							name="format"
							defaultValue="csv"
							render={({ field }) => (
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="csv">CSV</SelectItem>
										<SelectItem value="json">JSON</SelectItem>
									</SelectContent>
								</Select>
							)}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Date</Label>
						<Controller
							control={control}
							name="date_range"
							defaultValue={{
								from: search.start_date,
								to: search.end_date,
							}}
							render={({ field }) => (
								<CalendarDateRangePicker
									className="w-full"
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						/>
					</div>
				</form>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => reset()}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={() => formRef.current.requestSubmit()}>
						Download
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
