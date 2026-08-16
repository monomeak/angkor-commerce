import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const COLUMN_HEADERS = ["", "Name", "SKU", "Category", "Price", "Stock", "Status", ""];

/** Mirrors the real table's column count so the layout doesn't shift when data lands. */
export function ProductTableSkeleton({ rows = 8 }: { readonly rows?: number }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {COLUMN_HEADERS.map((header, index) => (
                            <TableHead key={`${header}-${index}`}>{header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            <TableCell>
                                <Skeleton className="size-10 rounded-md" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-40" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-24" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-20" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-14" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="size-8 rounded-md" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
