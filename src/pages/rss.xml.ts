import rss from "@astrojs/rss";
import { getPublishedWriting } from "../lib/content";
import { writingPath } from "../lib/urls";
import { SITE } from "../config/site";

export async function GET() {
  const posts = await getPublishedWriting();

  return rss({
    title: `${SITE.name} — Journal`,
    description:
      "Technical notes on systems, cloud infrastructure, and practical engineering.",
    site: SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: writingPath(post.data.slug),
    })),
    customData: "<language>en-us</language>",
  });
}
