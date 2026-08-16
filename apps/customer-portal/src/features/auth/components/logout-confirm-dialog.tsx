"use client";

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

type LogoutConfirmDialogProps = {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onConfirm: () => void;
};

export function LogoutConfirmDialog({ open, onOpenChange, onConfirm }: LogoutConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You&apos;ll need to sign in again to reach your orders, favorites and saved addresses.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Stay signed in</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Log out</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
