"use client";

import { useEffect } from "react";

import type { Locale } from "../i18n/routing";

export function LocaleDocument({ locale }: { readonly locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
