"use client";

import { useEffect } from "react";

const CONFIRM_MESSAGE = "You have unsaved changes. Leave this page and lose them?";

/**
 * Warns before losing an in-progress form.
 *
 * The App Router deliberately exposes no navigation-blocking API (there is no
 * router.events, and next/navigation cannot cancel a push mid-flight), so this covers the
 * two routes out of the page it actually can:
 *
 *   - beforeunload for reload, tab close and external navigation
 *   - a capture-phase click listener for in-app <Link> clicks, which run through an anchor
 *
 * What it cannot intercept is programmatic router.push() from elsewhere in the app or a
 * browser back gesture. Those are rarer than a mis-click on the sidebar, and the alternative
 * — a full custom navigation shim — costs far more than it protects here.
 */
export function useUnsavedChangesWarning(isEnabled: boolean): void {
    useEffect(() => {
        if (!isEnabled) return;

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            // Browsers ignore custom text now and show their own copy; assigning
            // returnValue is still what triggers the prompt at all.
            event.returnValue = CONFIRM_MESSAGE;
        };

        const handleClick = (event: MouseEvent) => {
            // Let modified clicks through — they open a new tab, so this page survives.
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }
            if (event.button !== 0) return;

            const anchor = (event.target as HTMLElement | null)?.closest?.("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (!href || href.startsWith("#") || anchor.target === "_blank") return;

            // Same destination — nothing would be lost.
            if (href === window.location.pathname + window.location.search) return;

            if (!window.confirm(CONFIRM_MESSAGE)) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        // Capture phase: Next's Link handles clicks on bubble, so this has to run first
        // to be able to stop it.
        document.addEventListener("click", handleClick, true);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("click", handleClick, true);
        };
    }, [isEnabled]);
}
