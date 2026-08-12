"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProductFormValues } from "../schemas/product-form.schema";

type ProductVariantRowsProps = {
    readonly control: Control<ProductFormValues>;
    readonly register: UseFormRegister<ProductFormValues>;
    readonly errors: FieldErrors<ProductFormValues>;
    readonly currency: string;
};

/**
 * Variants are edited in place, as rows, because that is how they are read: a shop manager
 * comparing stock across four sizes wants them side by side, not behind four modals.
 *
 * A product must keep at least one variant — it carries no stock or SKU of its own, so
 * removing the last row would make it unsellable (and core-api rejects it with @NotEmpty).
 */
export function ProductVariantRows({ control, register, errors, currency }: ProductVariantRowsProps) {
    const t = useTranslations("Catalog");
    const { fields, append, remove } = useFieldArray({ control, name: "variants" });

    const variantErrors = errors.variants;
    // The array-level error (min length) sits on the array itself, not on any row.
    const arrayMessage = Array.isArray(variantErrors) ? undefined : variantErrors?.message;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium">{t("variants")}</h3>
                    <p className="text-muted-foreground text-sm">{t("variantsHint")}</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ size: null, sku: "", stock: 0, priceOverride: null })}
                >
                    <Plus className="size-4" />
                    {t("addVariant")}
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-36">{t("size")}</TableHead>
                            <TableHead>{t("sku")}</TableHead>
                            <TableHead className="w-28">{t("stock")}</TableHead>
                            <TableHead className="w-40">{t("priceOverride", { currency: currency || "—" })}</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.map((field, index) => {
                            const rowError = Array.isArray(variantErrors) ? variantErrors[index] : undefined;

                            return (
                                <TableRow key={field.id}>
                                    <TableCell className="align-top">
                                        <Field data-invalid={Boolean(rowError?.size)}>
                                            <FieldLabel className="sr-only">Size for row {index + 1}</FieldLabel>
                                            <Input placeholder="S / M / 42" {...register(`variants.${index}.size`)} />
                                            <FieldError errors={[rowError?.size]} />
                                        </Field>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Field data-invalid={Boolean(rowError?.sku)}>
                                            <FieldLabel className="sr-only">SKU for row {index + 1}</FieldLabel>
                                            <Input placeholder="TSHIRT-BLK-S" {...register(`variants.${index}.sku`)} />
                                            <FieldError errors={[rowError?.sku]} />
                                        </Field>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Field data-invalid={Boolean(rowError?.stock)}>
                                            <FieldLabel className="sr-only">Stock for row {index + 1}</FieldLabel>
                                            <Input
                                                type="number"
                                                min={0}
                                                step={1}
                                                {...register(`variants.${index}.stock`)}
                                            />
                                            <FieldError errors={[rowError?.stock]} />
                                        </Field>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Field data-invalid={Boolean(rowError?.priceOverride)}>
                                            <FieldLabel className="sr-only">
                                                Price override for row {index + 1}
                                            </FieldLabel>
                                            <Input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                placeholder={t("inherit")}
                                                {...register(`variants.${index}.priceOverride`)}
                                            />
                                            <FieldError errors={[rowError?.priceOverride]} />
                                        </Field>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={t("removeVariant", { index: index + 1 })}
                                            disabled={fields.length === 1}
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {arrayMessage && <p className="text-destructive text-sm">{arrayMessage}</p>}
        </div>
    );
}
