import { Column, Heading, Meta } from "@once-ui-system/core";
import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { baseURL, blog, getLocalizedContent } from "@/resources";

type Lang = "tr" | "en";

export function generateStaticParams(): { lang: Lang }[] {
  return [{ lang: "tr" }, { lang: "en" }];
}

export function generateMetadata({ params }: { params: { lang: Lang } }) {
  const { blog: localizedBlog } = getLocalizedContent(params.lang);
  return Meta.generate({
    title: localizedBlog.title,
    description: localizedBlog.description,
    baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(blog.title)}`,
    path: `/blog/${params.lang}`,
  });
}

export default async function LocalizedBlog({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const { blog: localizedBlog, newsletter } = getLocalizedContent(lang);

  return (
    <Column maxWidth="m" paddingTop="24">
      <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
        {localizedBlog.title}
      </Heading>
      <Column fillWidth flex={1} gap="40">
        <Posts range={[1, 1]} thumbnail lang={lang} />
        <Posts range={[2, 3]} columns="2" thumbnail direction="column" lang={lang} />
        <Mailchimp marginBottom="l" newsletterCopy={newsletter} />
        <Heading as="h2" variant="heading-strong-xl" marginLeft="l">
          {lang === "en" ? "Earlier posts" : "Önceki yazılar"}
        </Heading>
        <Posts range={[4]} columns="2" lang={lang} />
      </Column>
    </Column>
  );
}
