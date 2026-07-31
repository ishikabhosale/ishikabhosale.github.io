import { getCollection, type CollectionEntry } from "astro:content";

type DatedEntry = { publishedAt: Date };

export function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function sortByDate<T extends DatedEntry>(entries: readonly T[]): T[] {
  return [...entries].sort(
    (left, right) => right.publishedAt.getTime() - left.publishedAt.getTime(),
  );
}

export async function getPublishedWriting(): Promise<
  CollectionEntry<"writing">[]
> {
  const entries = await getCollection("writing", ({ data }) => !data.draft);
  return sortByDate(entries.map((entry) => ({ ...entry, publishedAt: entry.data.publishedAt }))).map(
    ({ publishedAt: _publishedAt, ...entry }) => entry,
  ) as CollectionEntry<"writing">[];
}

export async function getFeaturedProjects(): Promise<
  CollectionEntry<"projects">[]
> {
  const entries = await getCollection(
    "projects",
    ({ data }) => data.featured,
  );
  return entries.toSorted((left, right) => left.data.order - right.data.order);
}
