import { type Search } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Search>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "created_by_id",
        header: "Created By",
    },
    {
        accessorKey: "frequency",
        header: "Frequency",
    },
    {
        accessorKey: "keywords",
        header: "Keywords",
    },
    {
        accessorKey: "twitter",
        header: "Twitter",
    },
    {
        accessorKey: "facebook",
        header: "Facebook",
    },
];