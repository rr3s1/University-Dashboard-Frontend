// ***** src/pages/subjects/list.tsx *****
import React, {useDeferredValue, useMemo, useState} from 'react'
import {ListView} from "@/components/refine-ui/views/list-view.tsx";
import {Breadcrumb} from "@/components/refine-ui/layout/breadcrumb.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {DEPARTMENT_OPTIONS} from "@/constants";
import {CreateButton} from "@/components/refine-ui/buttons/create.tsx";
import {DataTable} from "@/components/refine-ui/data-table/data-table.tsx";
import {useTable} from "@refinedev/react-table";
import {Subject} from "@/types";
import {Badge} from "@/components/ui/badge.tsx";
import {ColumnDef} from "@tanstack/react-table";

const SubjectsList = () => {
    // State for managing search query input
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearchQuery = useDeferredValue(searchQuery);
    // State for managing selected department filter
    const [selectedDepartment, setSelectedDepartment] = useState("all");

    // Memoize so Refine/React Query list keys stay stable across renders (new [] each render would churn the query).
    const departmentFilters = useMemo(
        () =>
            selectedDepartment === "all"
                ? []
                : [{ field: "department", operator: "eq" as const, value: selectedDepartment }],
        [selectedDepartment],
    );
    const searchFilters = useMemo(
        () =>
            deferredSearchQuery
                ? [{ field: "name", operator: "contains" as const, value: deferredSearchQuery }]
                : [],
        [deferredSearchQuery],
    );
    const permanentFilters = useMemo(
        () => [...departmentFilters, ...searchFilters],
        [departmentFilters, searchFilters],
    );

    // useTable hook manages data fetching, sorting, filtering, and pagination
    const subjectTable = useTable<Subject>({
        // Columns define table structure and rendering
        columns: useMemo<ColumnDef<Subject>[]>(() => [
            {
                id: 'code',
                accessorKey: 'code',
                size: 100,
                // Header renders column title with styling
                header: () => <p className="column-title ml-2">Code</p>,
                // Cell renders badge component for code values
                cell: ({getValue}) => <Badge>{getValue<string>()}</Badge>
            },
            {
                id: 'name',
                accessorKey: 'name',
                size: 200,
                header: () => <p className="column-title">Name</p>,
                cell: ({getValue}) => <span className='text-foreground'>{getValue<string>()}</span>
            },
            {
                id: 'department',
                accessorFn: (row) => row.department?.name,
                size: 150,
                header: () => <p className="column-title">Department</p>,
                cell: ({getValue}) => (
                    <Badge variant="secondary">{getValue<string | undefined>() ?? 'Unassigned'}</Badge>
                )
            },
            {
                id: 'description',
                accessorKey: 'description',
                size: 300,
                header: () => <p className="column-title">Description</p>,
                // Truncates long text to two lines maximum
                cell: ({getValue}) => <span className="line-clamp-2 wrap-break-word">{getValue<string>()}</span>
            }
        ], []),
        // Refine Core configuration for data management
        refineCoreProps: {
            // DataTable shows errors keyed by fetch attempt; disable duplicate Refine useList toast
            errorNotification: false,
            // Resource name must match App.tsx resource definition
            resource: "subjects",
            // Pagination configuration for server-side data fetching
            pagination: {pageSize: 10, mode: 'server'},
            // Permanent filters apply to all data requests
            filters: {
                permanent: permanentFilters,
            },
            queryOptions: {
                retry: false,
            },
            // Initial sorting configuration
            sorters: {
                initial: [
                    {field: 'id', order: 'desc'}
                ]
            },
        }
    });

    return (
        // ListView provides consistent page layout structure
        <ListView>
            {/* Breadcrumb displays current navigation path */}
            <Breadcrumb />
            {/* Page title with custom styling class */}
            <h1 className="page-title">Subjects</h1>
            {/* Intro row contains page description */}
            <div className="intro-row">
                <p>Quick access to essential metrics and management tools.</p>
                {/* Actions row contains all interactive controls */}
                <div className="actions-row">
                    {/* Search field with icon and input */}
                    <div className="search-field">
                        <Search className="search-icon" />
                        <Input
                            type="text"
                            placeholder="Search by name..."
                            className="pl-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Filter and action buttons container */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        {/* Department filter dropdown */}
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {/* Dynamic department options from constants */}
                                {DEPARTMENT_OPTIONS.map((department) => (
                                    <SelectItem key={department.value} value={department.value}>
                                        {department.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* Create button auto-redirects to create page */}
                        <CreateButton />
                    </div>
                </div>
            </div>
            {/* DataTable renders the configured table with all features */}
            <DataTable table={subjectTable} />
        </ListView>
    )
}
export default SubjectsList
