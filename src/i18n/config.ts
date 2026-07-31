import { en, type Dictionary } from "./en";
import { ja } from "./ja";

export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];

const dictionaries: Record<Locale, Dictionary> = { en, ja };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function localeFromPath(pathname: string): Locale {
  return /^\/ja(?:\/|$)/.test(pathname) ? "ja" : "en";
}

export function localizedPath(pathname: string, locale: Locale): string {
  const match = pathname.match(/^([^?#]*)(.*)$/);
  const rawPath = match?.[1] || "/";
  const suffix = match?.[2] || "";
  const unprefixed = rawPath.replace(/^\/ja(?=\/|$)/, "") || "/";

  if (locale === "en") {
    return `${unprefixed.startsWith("/") ? unprefixed : `/${unprefixed}`}${suffix}`;
  }

  const target = unprefixed === "/" ? "/ja/" : `/ja${unprefixed}`;
  return `${target}${suffix}`;
}
