import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { routing } from "../i18n/routing";
import { LocaleDocument } from "./locale-document";

type LocaleLayoutProps = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider
      key={locale}
      locale={locale}
      messages={messages}
    >
      <LocaleDocument locale={locale} />
      <div
        lang={locale}
        data-locale={locale}
        className="contents"
      >
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
