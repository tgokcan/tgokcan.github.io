import { Column, Heading, Text } from "@once-ui-system/core";
import { fetchContributions, getGitHubUsername } from "@/lib/github";
import { ContributionGraph } from "./ContributionGraph";

export async function GitHubContributionGraph() {
  const data = await fetchContributions();
  const username = getGitHubUsername();

  if (!data || data.contributions.length === 0) {
    return null;
  }

  return (
    <Column fillWidth gap="m" paddingX="l">
      <Column fillWidth gap="4">
        <Heading as="h2" variant="heading-strong-l">
          Contribution graph
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          GitHub contribution activity from the last year
        </Text>
      </Column>
      <ContributionGraph
        total={data.total}
        contributions={data.contributions}
        username={username}
      />
    </Column>
  );
}
