import { Headset, PackageCheck, ShieldCheck, Truck } from "lucide-react";

import { IconBadge } from "@/components/home/icon-badge";

const services = [
    {
        icon: Truck,
        title: "Nationwide delivery",
        description: "Delivered across Cambodia within a few business days."
    },
    {
        icon: ShieldCheck,
        title: "Authentic craftsmanship",
        description: "Sourced from local weavers and makers."
    },
    {
        icon: PackageCheck,
        title: "Easy returns",
        description: "Not the right fit? Return within 14 days."
    },
    {
        icon: Headset,
        title: "Customer support",
        description: "Reach us any day of the week."
    }
];

export function ServiceSection() {
    return (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Shopping Benefits</h2>
            </div>
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
                {services.map(({ icon, title, description }) => (
                    <div key={title} className="flex flex-col items-start gap-3">
                        <IconBadge icon={icon} />
                        <h3 className="font-medium">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
