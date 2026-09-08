import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import { baseURL, about, person, work, getLocalizedContent } from "@/resources";
import { GitHubRepos } from "@/components/work/GitHubRepos";
import { GitHubContributionGraph } from "@/components/github/GitHubContributionGraph";

export async function generateMetadata({ params }: { params?: Promise<{ lang?: "tr" | "en" }> } = {}) {
  const { lang = "en" } = (await params) || {};
  const { work: localizedWork } = getLocalizedContent(lang);
  return Meta.generate({
    title: localizedWork.title,
    description: localizedWork.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(work.title)}`,
    path: work.path,
  });
}

export default async function Work({ params }: { params?: Promise<{ lang?: "tr" | "en" }> }) {
  const { lang = "en" } = (await params) || {};
  const { work: localizedWork } = getLocalizedContent(lang);
  return (
    <Column maxWidth="m" paddingTop="24" gap="xl">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={work.path}
        title={localizedWork.title}
        description={localizedWork.description}
        image={`/api/og/generate?title=${encodeURIComponent(work.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Heading marginBottom="l" variant="heading-strong-xl" align="center">
        {localizedWork.title}
      </Heading>
      <GitHubContributionGraph />
      <GitHubRepos />
    </Column>
  );
}
