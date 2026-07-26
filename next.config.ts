import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repo = process.env.NEXT_PUBLIC_REPO_NAME || '';
if (isGithubActions && !repo) {
  repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'RECQR';
} else if (!repo && process.env.NODE_ENV === 'production') {
  // Fallback for manual github pages deploy
  repo = 'RECQR';
}

// Only use basePath if we have a repo name and we're not running locally in dev mode
const shouldUseBasePath = repo && process.env.NODE_ENV !== 'development';

const nextConfig: NextConfig = {
  output: "export",
  basePath: shouldUseBasePath ? `/${repo}` : undefined,
  assetPrefix: shouldUseBasePath ? `/${repo}/` : undefined,
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
