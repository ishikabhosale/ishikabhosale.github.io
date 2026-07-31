import { localizedPath, type Locale } from "../i18n/config";

export function writingPath(slug: string, locale: Locale = "en"): string {
  return localizedPath(`/writing/${slug}/`, locale);
}

export function projectPath(slug: string, locale: Locale = "en"): string {
  return localizedPath(`/work/${slug}/`, locale);
}
