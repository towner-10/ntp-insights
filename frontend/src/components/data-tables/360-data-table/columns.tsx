"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

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

    {
      id: "actions",
      cell: ({ row }) => {
        const payment = row.original
   
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Copy link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]


