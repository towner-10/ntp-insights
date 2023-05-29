import { type Search } from '@prisma/client';
import { DataTable } from './data-tables/searches/data-table';
import { columns } from './data-tables/searches/columns';

type Props = {
	searches: Search[];
};

export function SearchesDataTable(props: Props) {
	// Add zero width spaces to commas in the keywords column
	const searches = props.searches.map((search) => {
		search.keywords = search.keywords.map((keyword) => {
			return '\u200B' + keyword;
		});
		return search;
	});

	return <DataTable columns={columns} data={searches} />;
}
