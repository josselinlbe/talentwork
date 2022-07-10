export type SocialProofDto = {
  totalDownloads?: number;
  totalMembers?: number;
  members: {
    user: string;
    avatar_url: string;
  }[];
};
