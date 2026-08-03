import { ReactNode } from "react";

type CatalogLayoutProps = {
    readonly children: ReactNode;
};

export default function CatalogLayout({ children }: CatalogLayoutProps) {
    return (
        <section className="space-y-6">
            <div className="pt-2">{children}</div>
        </section>
    );
}
