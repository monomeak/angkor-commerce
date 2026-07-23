"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Locale = "en" | "km";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}
const LocaleContext = createContext<LocaleContextValue | null>(null);
interface LocaleProviderProps {
  readonly children: ReactNode;
}

export function LocaleProviderConfig({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>("en");

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }

  return context;
}
