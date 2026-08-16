"use client";

import { Fragment } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
// The locale-aware Link, so crumbs keep the current locale prefix.
import { Link } from "@/app/i18n/navigation";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";

export function PageBreadcrumbs() {
    const crumbs = useBreadcrumbs();

    // A single crumb is just the page title, which the header already shows.
    if (crumbs.length < 2) {
        return null;
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs.map((crumb, index) => (
                    <Fragment key={`${crumb.label}-${index}`}>
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                            {crumb.href ? (
                                <BreadcrumbLink render={<Link href={crumb.href}>{crumb.label}</Link>} />
                            ) : (
                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
