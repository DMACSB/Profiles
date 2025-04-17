"use client"

import { useState, useEffect } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Download, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSupabase } from "@/lib/supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type Profile = {
  id: string
  name: string
  gender: string
  age: number
  date_of_birth: string
  photo_url: string
  language_spoken: string
  mode_of_entry: string
  entry_point: string
  date_of_entry: string
  assisting_network: string
  last_known_address: string
  current_location: string
  migration_pattern: string
  associated_locations: string
  current_occupation: string
  cover_identity: string
  support_network: string
  criminal_background: string
  case_registered: string
  detained_by: string
  court_proceedings_status: string
  embassy_contacted: boolean
  seized_ids: string
  intelligence_dossier: string
  created_at: string
}

export function ProfilesDataTable() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

        if (error) throw error

        setData(data || [])
      } catch (error) {
        console.error("Error fetching profiles:", error)
        toast({
          title: "Error",
          description: "Failed to load profiles. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [supabase, toast])

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const profile = row.original
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.photo_url || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{profile.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "gender",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Gender
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <Badge variant="outline">{row.getValue("gender")}</Badge>,
    },
    {
      accessorKey: "age",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Age
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "current_location",
      header: "Current Location",
    },
    {
      accessorKey: "current_occupation",
      header: "Occupation",
    },
    {
      accessorKey: "date_of_entry",
      header: "Entry Date",
      cell: ({ row }) => {
        const date = row.getValue("date_of_entry") as string
        return date ? format(new Date(date), "PPP") : "N/A"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const profile = row.original

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
              <DropdownMenuItem onClick={() => router.push(`/profiles/${profile.id}`)}>View details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/profiles/${profile.id}/edit`)}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Handle delete
                  if (confirm("Are you sure you want to delete this profile?")) {
                    supabase
                      .from("profiles")
                      .delete()
                      .eq("id", profile.id)
                      .then(({ error }) => {
                        if (error) {
                          toast({
                            title: "Error",
                            description: "Failed to delete profile",
                            variant: "destructive",
                          })
                        } else {
                          toast({
                            title: "Success",
                            description: "Profile deleted successfully",
                          })
                          // Remove from local state
                          setData(data.filter((p) => p.id !== profile.id))
                        }
                      })
                  }
                }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const exportToCSV = () => {
    // Get visible and filtered data
    const filteredData = table.getFilteredRowModel().rows.map((row) => row.original)

    // Convert to CSV
    const headers = columns
      .filter((col) => col.accessorKey && table.getColumn(col.accessorKey)?.getIsVisible())
      .map((col) => col.accessorKey as string)

    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof Profile]
            // Handle commas and quotes in the data
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `profiles-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Loading profiles...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer"
                    onClick={() => router.push(`/profiles/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No profiles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} of {table.getRowModel().rows.length} row(s)
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
