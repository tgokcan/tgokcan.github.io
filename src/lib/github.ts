import { social } from "@/resources";

export interface GitHubRepo {
  name: string;
  description: string | null;
  htmlUrl: string;
  fork: boolean;
  forkSource: { fullName: string; htmlUrl: string } | null;
  stargazersCount: number;
  forksCount: number;
  language: string | null;
  updatedAt: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface ContributionData {
  total: number;
  contributions: ContributionDay[];
}

const GITHUB_USERNAME =
  social.find((s) => s.name === "GitHub")?.link.replace(/\/$/, "").split("/").pop() ?? "tgokcan";

const REVALIDATE_SECONDS = 3600;

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "magic-portfolio",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

export function getGitHubUsername(): string {
  return GITHUB_USERNAME;
}

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  const response = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=owner`,
    {
      headers: githubHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    console.error("Failed to fetch GitHub repos:", response.status);
    return [];
  }

  const data = await response.json();

  const repos = await Promise.all(
    data.map(
      async (repo: {
        name: string;
        description: string | null;
        html_url: string;
        fork: boolean;
        parent?: { full_name: string; html_url: string };
        stargazers_count: number;
        forks_count: number;
        language: string | null;
        updated_at: string;
      }) => ({
        name: repo.name,
        description: repo.description,
        htmlUrl: repo.html_url,
        fork: repo.fork,
        forkSource: repo.parent
          ? { fullName: repo.parent.full_name, htmlUrl: repo.parent.html_url }
          : null,
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        language: repo.language ?? (await fetchPrimaryLanguage(repo.name)),
        updatedAt: repo.updated_at,
      }),
    ),
  );

  return repos.sort(
    (a: GitHubRepo, b: GitHubRepo) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

async function fetchPrimaryLanguage(repoName: string): Promise<string | null> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/languages`,
    {
      headers: githubHeaders(),
      next: { revalidate: REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) return null;

  const languages = (await response.json()) as Record<string, number>;
  return Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

async function fetchContributionsFromGraphQL(): Promise<ContributionData | null> {
  if (!process.env.GITHUB_TOKEN) return null;

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { username: GITHUB_USERNAME } }),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) return null;

  const json = await response.json();
  const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar;

  if (!calendar) return null;

  const contributions: ContributionDay[] = calendar.weeks.flatMap(
    (week: { contributionDays: { contributionCount: number; date: string }[] }) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: getContributionLevel(day.contributionCount),
      })),
  );

  return {
    total: calendar.totalContributions,
    contributions,
  };
}

async function fetchContributionsFromPublicApi(): Promise<ContributionData | null> {
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}`,
    { next: { revalidate: REVALIDATE_SECONDS } },
  );

  if (!response.ok) return null;

  const json = await response.json();
  const contributions: ContributionDay[] = (json.contributions ?? []).map(
    (day: { date: string; count: number; level: number }) => ({
      date: day.date,
      count: day.count,
      level: day.level,
    }),
  );

  const total = contributions.reduce((sum, day) => sum + day.count, 0);

  return { total, contributions };
}

function getContributionLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

export async function fetchContributions(): Promise<ContributionData | null> {
  const fromGraphQL = await fetchContributionsFromGraphQL();
  if (fromGraphQL) return fromGraphQL;

  return fetchContributionsFromPublicApi();
}

export const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  MDX: "#fcb32c",
  Markdown: "#083fa1",
  Dockerfile: "#384d54",
  HCL: "#844FBA",
  Terraform: "#844FBA",
};

export function getLanguageColor(language: string | null): string {
  if (!language) return "var(--neutral-on-background-weak)";
  return languageColors[language] ?? "var(--neutral-on-background-weak)";
}
