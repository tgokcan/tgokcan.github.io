"use client";

import { useEffect, useState } from "react";
import { Column, Heading, Text } from "@once-ui-system/core";
import { fetchContributions, getGitHubUsername } from "@/lib/github";
import { ContributionGraph } from "./ContributionGraph";

type ContributionData = Awaited<ReturnType<typeof fetchContributions>>;

export function GitHubContributionGraph() {
  const [data, setData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const username = getGitHubUsername();

  useEffect(() => {
    let isMounted = true;

    fetchContributions()
      .then((result) => {
        if (isMounted) setData(result);
      })
      .catch((error) => {
        console.error("GitHub contribution verisi çekilemedi:", error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Column fillWidth gap="m" paddingX="l">
        <Text variant="body-default-s" onBackground="neutral-weak">
          Loading contribution graph...
        </Text>
      </Column>
    );
  }

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