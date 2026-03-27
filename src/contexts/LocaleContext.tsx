import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("nl");

export const LocaleProvider = LocaleContext.Provider;
export const useLocale = () => useContext(LocaleContext);
