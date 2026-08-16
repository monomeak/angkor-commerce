"use client";

import { FolderTree, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApiError } from "@/lib/api-client";
import { ProductErrorState } from "../../products/components/product-list-states";
import { CategoryFormDialog } from "../components/category-form-dialog";
import { useCategories } from "../hooks/use-categories";
import { useDeleteCategory } from "../hooks/use-category-mutations";
import { sortCategoriesAsTree } from "../lib/category-tree";
import type { Category } from "../types/category";

export function CategoriesView() {
    const t = useTranslations("Catalog");
    const { data: categories, isPending, isError, error, refetch } = useCategories();
    const deleteCategory = useDeleteCategory();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [toDelete, setToDelete] = useState<Category | null>(null);

    const openCreate = () => {
        setEditing(null);
        setIsFormOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditing(category);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!toDelete) return;

        try {
            await deleteCategory.mutateAsync(toDelete.id);
            toast.success(t("categoryDeleted", { name: toDelete.name }));
            setToDelete(null);
        } catch (cause) {
            // The API refuses to delete a category that still has products or children.
            toast.error(cause instanceof ApiError ? cause.displayMessage : t("deleteCategoryFailed"));
        }
    };

    const rows = categories ? sortCategoriesAsTree(categories) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{t("categoriesTitle")}</h1>
                    <p className="text-muted-foreground text-sm">{t("categoriesSubtitle")}</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="size-4" />
                    {t("newCategory")}
                </Button>
            </div>

            {isPending ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full" />
                    ))}
                </div>
            ) : isError ? (
                <ProductErrorState error={error} onRetry={() => void refetch()} />
            ) : rows.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FolderTree />
                        </EmptyMedia>
                        <EmptyTitle>{t("noCategoriesTitle")}</EmptyTitle>
                        <EmptyDescription>{t("noCategoriesBody")}</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={openCreate}>{t("newCategory")}</Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("categoryName")}</TableHead>
                                <TableHead>{t("slug")}</TableHead>
                                <TableHead className="w-28">{t("sortOrder")}</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map(({ category, depth }) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        {/* Indentation carries the hierarchy; the tree is
                                            shallow enough that nested tables would be overkill. */}
                                        <span
                                            style={{ paddingLeft: `${depth * 1.5}rem` }}
                                            className="flex items-center gap-2"
                                        >
                                            {depth > 0 && <span className="text-muted-foreground">↳</span>}
                                            <span className="font-medium">{category.name}</span>
                                            {depth === 0 && <Badge variant="secondary">{t("topLevel")}</Badge>}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-sm">
                                        {category.slug}
                                    </TableCell>
                                    <TableCell className="tabular-nums">{category.sortOrder}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger
                                                render={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label={`Actions for ${category.name}`}
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                }
                                            />
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEdit(category)}>
                                                    <Pencil className="size-4" />
                                                    {t("edit")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() => setToDelete(category)}
                                                >
                                                    <Trash2 className="size-4" />
                                                    {t("delete")}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <CategoryFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                categories={categories ?? []}
                category={editing}
            />

            <AlertDialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteCategoryTitle", { name: toDelete?.name ?? "" })}</AlertDialogTitle>
                        <AlertDialogDescription>{t("deleteCategoryBody")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteCategory.isPending}>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                void handleDelete();
                            }}
                            disabled={deleteCategory.isPending}
                        >
                            {deleteCategory.isPending ? t("deleting") : t("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
