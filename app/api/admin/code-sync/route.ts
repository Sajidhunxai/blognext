import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RepoResult {
  repo: string;
  status: "success" | "error";
  message: string;
}

interface RequestBody {
  upstream?: string;
  repos?: string[] | string;
}

function parseRepos(input: string | string[] | undefined, envFallback: string | undefined): string[] {
  const raw = input ?? envFallback;
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.map((r) => r.trim()).filter(Boolean);
  }

  const trimmed = raw.trim();
  if (!trimmed) return [];

  // Prefer JSON array but also support comma/newline separated list
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) {
        return arr.map((r) => String(r).trim()).filter(Boolean);
      }
    } catch {
      // fall through to string parsing
    }
  }

  return trimmed
    .split(/[\n,]+/)
    .map((r) => r.trim())
    .filter(Boolean);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.CODE_SYNC_GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "Code sync token is not configured. Please set CODE_SYNC_GITHUB_TOKEN in your environment.",
      },
      { status: 500 }
    );
  }

  let body: RequestBody = {};
  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      body = (await req.json()) as RequestBody;
    }
  } catch {
    // Ignore body parse errors and fall back to env config
    body = {};
  }

  const upstream =
    body.upstream ||
    process.env.CODE_SYNC_UPSTREAM_REPO ||
    process.env.GITHUB_REPOSITORY ||
    "";

  const repos = parseRepos(body.repos, process.env.CODE_SYNC_REPOS);

  if (!repos.length) {
    return NextResponse.json(
      {
        error:
          "No repositories configured. Provide repos in the dashboard form or set CODE_SYNC_REPOS.",
      },
      { status: 400 }
    );
  }

  const results: RepoResult[] = [];

  for (const repo of repos) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo}/dispatches`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github+json",
          },
          body: JSON.stringify({
            event_type: "sync_from_upstream",
            client_payload: {
              upstream,
            },
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        results.push({
          repo,
          status: "error",
          message: `GitHub API error ${response.status}: ${text.slice(
            0,
            200
          )}`,
        });
      } else {
        results.push({
          repo,
          status: "success",
          message: "Dispatch sent to GitHub Actions",
        });
      }
    } catch (error: any) {
      results.push({
        repo,
        status: "error",
        message: error?.message || "Unknown error",
      });
    }
  }

  const success = results.every((r) => r.status === "success");

  return NextResponse.json({
    success,
    upstream,
    results,
  });
}

