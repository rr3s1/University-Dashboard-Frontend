import React, { useMemo } from "react";
import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { useTable } from "@refinedev/react-table";
import type { Department } from "@/types";
import { Badge } from "@/components/ui/badge.tsx";
import type { ColumnDef } from "@tanstack/react-table";

const DepartmentsList = () => {
    const table = useTable<Department>({
        columns: useMemo<ColumnDef<Department>[]>(
            () => [
                {
                    id: "code",
                    accessorKey: "code",
                    size: 100,
                    header: () => <p className="column-title ml-2">Code</p>,
                    cell: ({ getValue }) => (
                        <Badge>{getValue<string>()}</Badge>
                    ),
                },
                {
                    id: "name",
                    accessorKey: "name",
                    size: 220,
                    header: () => <p className="column-title">Name</p>,
                    cell: ({ getValue }) => (
                        <span className="text-foreground">{getValue<string>()}</span>
                    ),
                },
                {
                    id: "description",
                    accessorKey: "description",
                    size: 360,
                    header: () => <p className="column-title">Description</p>,
                    cell: ({ getValue }) => (
                        <span className="line-clamp-2 wrap-break-word">
                            {getValue<string | null>() ?? "—"}
                        </span>
                    ),
                },
            ],
            [],
        ),
        refineCoreProps: {
            resource: "departments",
            pagination: { pageSize: 10, mode: "server" },
            sorters: { initial: [{ field: "id", order: "desc" }] },
        },
    });

    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">Departments</h1>
            <div className="intro-row">
                <p>University departments (one row per department record in the database).</p>
            </div>
            <DataTable table={table} />
        </ListView>
    );
};

export default DepartmentsList;
