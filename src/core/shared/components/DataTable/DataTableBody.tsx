import { ColumnDef, Table } from "@tanstack/react-table";
import { TableConfig } from "./types";
import { flexRender } from "@tanstack/react-table";

import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/shared/ui/table";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface TableBodyProps<TData, TValue> {
  table: Table<TData>;
  config: TableConfig<TData>;
  columns: ColumnDef<TData, TValue>[];
}

export const TableBodyDataTable = <TData, TValue>({
  table,
  config,
  columns,
}: TableBodyProps<TData, TValue>) => {
  return (
    <>
      <div className="rounded-lg border shadow-sm w-full min-w-0 overflow-hidden">
        <div className="overflow-x-auto w-full min-w-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 table-scroll-container">
          <TableComponent className="w-full min-w-max">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => {
                    const size = header.getSize();
                    return (
                      <TableHead
                        key={header.id}
                        className="h-12 px-6 text-left font-medium whitespace-nowrap"
                        style={{
                          width: `${size}%`,
                          minWidth: `${Math.max(size * 1.2, 80)}px`,
                        }}
                      >
                        {header.isPlaceholder ? null : config.enableSorting &&
                          header.column.getCanSort() ? (
                          <button
                            className="flex items-center gap-2 hover:text-gray-400"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <ChevronUpIcon className="h-4 w-4" />,
                              desc: <ChevronDownIcon className="h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const size = cell.column.getSize();
                      return (
                        <TableCell
                          key={cell.id}
                          className="px-6 py-4"
                          style={{
                            width: `${size}%`,
                            minWidth: `${Math.max(size * 1.2, 80)}px`,
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    {config.emptyStateMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableComponent>
        </div>
      </div>
    </>
  );
};
