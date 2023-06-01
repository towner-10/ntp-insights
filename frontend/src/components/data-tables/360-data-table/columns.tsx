"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Upload = {
    id: string
    name: string
    author: string
    date: string
  }

export const uploads: Upload[] = [
    {
        id: "1",
        name: "NTP 2023 Storm Event",
        author: "Tornado Man",
        date: "05-29-2023",
    },
    {
        id: "2",
        name: "London 2022 Derecho",
        author: "Kevin Manka",
        date: "05-18-2022",
    },
    {
        id: "3",
        name: "Barrie 2021 Tornado",
        author: "Collin Town",
        date: "07-17-2021",
    }
];

export const columns: ColumnDef<Upload>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "author",
      header: "Created by",
    },
    {
      accessorKey: "date",
      header: "Date created",
    },
  ]


