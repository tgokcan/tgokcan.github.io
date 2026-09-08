import BlogPost, { generateMetadata as blogMetadata } from "@/app/blog/[lang]/[slug]/page";
import { getPosts } from "@/utils/utils";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

export function generateStaticParams(): { lang: Locale; slug: string }[] {
  return ["tr", "en"].flatMap((lang) =>
    getPosts(["src", "app", "blog", "posts", lang]).map((post) => ({ lang: lang as Locale, slug: post.slug })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale; slug: string }> }): Promise<Metadata> {
  return blogMetadata({ params });
}

export default BlogPost;
