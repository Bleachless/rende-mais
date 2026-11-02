import type { MetadataRoute } from "next";
import { CHAPTERS } from "@/lib/chapters";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/aprenda`, changeFrequency: "monthly", priority: 0.9 },
    ...CHAPTERS.map((c) => ({ url: `${SITE}/aprenda/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${SITE}/aprenda/quiz`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
