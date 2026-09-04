import { Column, Grid, Heading, Text } from "@once-ui-system/core";
import { fetchGitHubRepos, getGitHubUsername } from "@/lib/github";
import { GitHubRepoCard } from "./GitHubRepoCard";

export async function GitHubRepos() {
  const repos = await fetchGitHubRepos();
  const username = getGitHubUsername();

  if (repos.length === 0) {
    return (
      <Column fillWidth paddingX="l" marginBottom="40" horizontal="center">
        <Text variant="body-default-m" onBackground="neutral-weak">
          Could not load repositories from GitHub.
        </Text>
      </Column>
    );
  }

  return (
    <Column fillWidth gap="l" marginBottom="40" paddingX="l">
      <Column fillWidth gap="4">
        <Heading as="h2" variant="heading-strong-l">
          Repositories
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          {repos.length} repositories from{" "}
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--brand-on-background-medium)" }}
          >
            @{username}
          </a>
        </Text>
      </Column>
      <Grid columns="3" l={{ columns: 2 }} s={{ columns: 1 }} fillWidth gap="16">
        {repos.map((repo) => (
          <GitHubRepoCard key={repo.name} repo={repo} />
        ))}
      </Grid>
    </Column>
  );
}
