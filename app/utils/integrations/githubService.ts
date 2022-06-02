import { SocialProofDto } from "~/application/dtos/marketing/SocialProofDto";
import { Octokit } from "octokit";

export async function getGitHubSocialProof(): Promise<SocialProofDto> {
  if (process.env.NODE_ENV === "development") {
    return {
      totalMembers: 100,
    };
  }
  const collaborators = await getGitHubRepositoryCollaborators();
  return {
    totalMembers: collaborators?.length ?? 0,
  };
}

export async function getGitHubCurrentRelease(): Promise<{ name: string | null; created_at: Date } | undefined> {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    await octokit.rest.users.getAuthenticated();
    const { data } = await octokit.rest.repos.listReleases({
      owner: "AlexandroMtzG",
      repo: "remix-saas-kit",
    });
    if (data.length > 0) {
      return {
        name: data[0].name,
        created_at: new Date(data[0].created_at),
      };
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("GITHUB ERROR", e);
  }
}

export async function getGitHubRepositoryReleases(): Promise<{ name: string | null; created_at: Date }[] | undefined> {
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    await octokit.rest.users.getAuthenticated();
    const { data } = await octokit.rest.repos.listReleases({
      owner: "AlexandroMtzG",
      repo: "remix-saas-kit",
    });
    return data.map((i) => {
      return {
        name: i.name,
        created_at: new Date(i.created_at),
      };
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("GITHUB ERROR", e);
  }
}

export async function getGitHubRepositoryCollaborators() {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    await octokit.rest.users.getAuthenticated();
    const { data } = await octokit.rest.repos.listCollaborators({
      owner: "AlexandroMtzG",
      repo: "remix-saas-kit",
    });
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("GITHUB ERROR", e);
  }
}
