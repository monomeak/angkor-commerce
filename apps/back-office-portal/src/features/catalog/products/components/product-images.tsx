"use client";

import { Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { useAppConfig } from "@/components/providers/app-config-provider";
import { ApiError } from "@/lib/api-client";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { MAX_PRODUCT_IMAGES } from "../lib/constants";
import { useDeleteProductImage, useUploadProductImage } from "../hooks/use-product-images";
import type { Product } from "../types/product";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

/**
 * Images can only be managed once the product exists — upload is POST /products/{id}/images,
 * so there is no id to attach them to on the create route. The create form therefore has no
 * image section at all and the user lands here straight after saving.
 *
 * Deliberately outside the react-hook-form tree: uploads and deletes take effect immediately
 * on the server, so folding them into the form's dirty state would imply they could be
 * cancelled by not saving.
 */
export function ProductImages({ product }: { readonly product: Product }) {
    const t = useTranslations("Catalog");
    const { mediaBaseUrl } = useAppConfig();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageToDelete, setImageToDelete] = useState<number | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    /*
     * dragenter/dragleave fire for every child element the pointer crosses, so a plain
     * boolean flickers as the cursor moves over the icon or the text. Counting enters
     * against leaves keeps the highlight steady until the pointer really exits.
     */
    const dragDepth = useRef(0);

    const upload = useUploadProductImage(product.id);
    const remove = useDeleteProductImage(product.id);

    const isAtLimit = product.images.length >= MAX_PRODUCT_IMAGES;

    const handleFiles = async (files: FileList | File[] | null) => {
        if (!files || files.length === 0) return;

        const remaining = MAX_PRODUCT_IMAGES - product.images.length;
        const selected = Array.from(files).slice(0, remaining);

        if (files.length > remaining) {
            toast.warning(t("imageLimitWarning", { count: remaining }));
        }

        // Sequential: the API counts existing images to enforce its own limit, so parallel
        // uploads could both pass the check and push the product over it.
        for (const file of selected) {
            try {
                await upload.mutateAsync(file);
            } catch (error) {
                toast.error(error instanceof ApiError ? error.displayMessage : t("uploadFailed", { name: file.name }));
                break;
            }
        }

        // Let the same file be picked again after a failure.
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleDragEnter = (event: React.DragEvent) => {
        event.preventDefault();
        dragDepth.current += 1;
        if (!isAtLimit && !upload.isPending) setIsDraggingOver(true);
    };

    const handleDragLeave = () => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setIsDraggingOver(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        dragDepth.current = 0;
        setIsDraggingOver(false);

        if (isAtLimit || upload.isPending) return;

        // Ignore anything that is not an image, so dragging a PDF in does not fail
        // server-side with a message about magic bytes.
        const images = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith("image/"));

        if (images.length === 0) {
            toast.error(t("onlyImages"));
            return;
        }

        void handleFiles(images);
    };

    const handleDelete = async () => {
        if (imageToDelete === null) return;

        try {
            await remove.mutateAsync(imageToDelete);
            toast.success(t("imageRemoved"));
            setImageToDelete(null);
        } catch (error) {
            toast.error(error instanceof ApiError ? error.displayMessage : t("removeFailed"));
        }
    };

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
                <div>
                    <CardTitle>{t("images")}</CardTitle>
                    <p className="text-muted-foreground text-sm">
                        {t("imagesUsed", { used: product.images.length, max: MAX_PRODUCT_IMAGES })}
                    </p>
                </div>
                {/* The drop zone below doubles as the browse button, so a second
                    "Add images" control here would just be two ways to do one thing. */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    multiple
                    className="sr-only"
                    onChange={(event) => void handleFiles(event.target.files)}
                />
            </CardHeader>
            <CardContent className="space-y-4">
                {/*
                 * Dropping files is the natural gesture when the images are already sitting
                 * in a folder. The zone stays a real button as well: drag-and-drop is not
                 * reachable by keyboard, so it can never be the only way in.
                 */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragOver={(event) => {
                        // Without this the browser navigates to the dropped file.
                        event.preventDefault();
                    }}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    disabled={isAtLimit || upload.isPending}
                    aria-label={t("dropImages")}
                    className={cn(
                        "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors",
                        "hover:border-muted-foreground/50 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                        isDraggingOver && "border-primary bg-primary/5",
                        (isAtLimit || upload.isPending) && "cursor-not-allowed opacity-60"
                    )}
                >
                    {upload.isPending ? (
                        <Loader2 className="text-muted-foreground size-6 animate-spin" />
                    ) : (
                        <UploadCloud
                            className={cn("size-6", isDraggingOver ? "text-primary" : "text-muted-foreground")}
                        />
                    )}
                    <span className="text-sm font-medium">
                        {isAtLimit
                            ? t("imageLimitReached", { max: MAX_PRODUCT_IMAGES })
                            : upload.isPending
                              ? t("uploading")
                              : isDraggingOver
                                ? t("dropToUpload")
                                : t("dropImages")}
                    </span>
                    <span className="text-muted-foreground text-xs">{t("imageTypes")}</span>
                </button>

                {product.images.length === 0 ? null : (
                    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {product.images.map((image) => {
                            const url = resolveMediaUrl(mediaBaseUrl, image.thumbnailUrl ?? image.imageUrl);
                            const isThumbnail =
                                image.thumbnailUrl !== null && image.thumbnailUrl === product.thumbnailUrl;

                            return (
                                <li key={image.id} className="group relative">
                                    <div className="bg-muted relative aspect-square overflow-hidden rounded-md border">
                                        {url && (
                                            <Image
                                                src={url}
                                                alt=""
                                                fill
                                                sizes="(max-width: 640px) 50vw, 200px"
                                                className="object-cover"
                                                unoptimized
                                            />
                                        )}
                                    </div>

                                    {isThumbnail && (
                                        <Badge className="absolute top-2 left-2 gap-1">
                                            <Star className="size-3" />
                                            {t("thumbnail")}
                                        </Badge>
                                    )}

                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        aria-label={t("removeImage")}
                                        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                                        onClick={() => setImageToDelete(image.id)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>

            <AlertDialog open={imageToDelete !== null} onOpenChange={(open) => !open && setImageToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("removeImageTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("removeImageBody")}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={remove.isPending}>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                void handleDelete();
                            }}
                            disabled={remove.isPending}
                        >
                            {remove.isPending ? t("removing") : t("remove")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
