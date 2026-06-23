import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as cheerio from "cheerio";
import {
  getGitHubLangSlug,
  fetchGitHubTrending,
  buildTrendshiftUrl,
  fetchTrendshiftTrending,
  parseRepoPath,
} from "./utils.js";

// Initialize the MCP Server
const server = new Server(
  {
    name: "github-trending-socratic-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_trending",
        description:
          "Fetches trending GitHub repositories by merging GitHub.com/trending and Trendshift.io. Supports daily, weekly, monthly timeframes, language filtering, and provides social discussion metrics (HN/Reddit/X).",
        inputSchema: {
          type: "object",
          properties: {
            period: {
              type: "string",
              enum: ["daily", "weekly", "monthly"],
              description: "The time period for trending repositories. Defaults to 'daily'.",
            },
            language: {
              type: "string",
              description: "Optional programming language filter (e.g., 'JavaScript', 'Python', 'Go').",
            },
            source: {
              type: "string",
              enum: ["github", "trendshift", "both"],
              description: "The source to fetch from: 'github', 'trendshift', or 'both' (merged & deduplicated). Defaults to 'both'.",
            },
            date: {
              type: "string",
              description:
                "Optional date/archive parameter for historical Trendshift data. E.g., '2026/25' (weekly) or '2026/6' (monthly). Ignored for daily and github-only sources.",
            },
            limit: {
              type: "integer",
              description: "Optional limit for the number of trending repositories to return. Defaults to 15 for daily, 18 for weekly, and 20 for monthly.",
            },
          },
        },
      },
      {
        name: "get_repo_details",
        description:
          "Fetches detailed information for a specific repository. If repoPathOrId is owner/name, resolves metadata and README content from GitHub API. If it's a number/id or Trendshift path, resolves social engagement from Trendshift.",
        inputSchema: {
          type: "object",
          properties: {
            repoPathOrId: {
              type: "string",
              description:
                "The repository path (e.g. 'owner/name'), Trendshift ID (e.g. '24682'), Trendshift path (e.g. '/repositories/24682'), or a full Trendshift URL.",
            },
          },
          required: ["repoPathOrId"],
        },
      },
    ],
  };
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_trending") {
      const period = args.period || "daily";
      const language = args.language || "";
      const source = args.source || "both";
      const date = args.date || "";
      const limit = args.limit ? parseInt(args.limit, 10) : null;

      let githubRepos = [];
      let trendshiftRepos = [];

      // Fetch based on source
      if (source === "github" || source === "both") {
        githubRepos = await fetchGitHubTrending(period, language);
      }
      if (source === "trendshift" || source === "both") {
        trendshiftRepos = await fetchTrendshiftTrending(period, language, date);
      }

      // Merge and deduplicate if source is 'both'
      if (source === "both") {
        const mergedMap = new Map();
        const orderedPaths = [];

        // 1. Add all GitHub repos to preserve their ranking order
        for (const gr of githubRepos) {
          const key = gr.repoPath.toLowerCase();
          mergedMap.set(key, {
            ...gr,
            source: "GitHub",
            trendshiftUrl: null,
            author: gr.repoPath.split("/")[0],
            keywords: [],
          });
          orderedPaths.push(key);
        }

        // 2. Merge with Trendshift repos
        for (const tr of trendshiftRepos) {
          const path = parseRepoPath(tr.githubUrl) || parseRepoPath(tr.name);
          if (!path) continue;

          const key = path.toLowerCase();
          if (mergedMap.has(key)) {
            // Repo exists in both sources
            const existing = mergedMap.get(key);
            mergedMap.set(key, {
              ...existing,
              source: "Cả hai",
              trendshiftUrl: tr.trendshiftUrl || existing.trendshiftUrl,
              author: tr.author || existing.author,
              keywords: tr.keywords && tr.keywords.length > 0 ? tr.keywords : existing.keywords,
              // Keep GitHub stats, but fallback to Trendshift description if GitHub description is missing
              description: existing.description || tr.description || null,
            });
          } else {
            // Trendshift only repo
            mergedMap.set(key, {
              repoPath: path,
              name: path,
              description: tr.description || null,
              stars: null,
              forks: null,
              language: tr.language || null,
              starsAdded: tr.starsText ? `${tr.starsText} stars` : null,
              githubUrl: tr.githubUrl || `https://github.com/${path}`,
              source: "Trendshift",
              trendshiftUrl: tr.trendshiftUrl || null,
              author: tr.author || path.split("/")[0],
              keywords: tr.keywords || [],
            });
            orderedPaths.push(key);
          }
        }

        // Generate final list of merged repositories
        let mergedList = orderedPaths.map((key, index) => ({
          position: index + 1,
          ...mergedMap.get(key),
        }));

        if (limit && mergedList.length > limit) {
          mergedList = mergedList.slice(0, limit);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                source: "Merged (GitHub + Trendshift)",
                period,
                language: language || "All",
                count: mergedList.length,
                repositories: mergedList,
              }, null, 2),
            },
          ],
        };
      }

      // If github only
      if (source === "github") {
        let list = githubRepos.map((r, idx) => ({
          position: idx + 1,
          source: "GitHub",
          ...r,
        }));
        if (limit && list.length > limit) {
          list = list.slice(0, limit);
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                source: "GitHub Trending Scraper",
                period,
                language: language || "All",
                count: list.length,
                repositories: list,
              }, null, 2),
            },
          ],
        };
      }

      // If trendshift only
      if (source === "trendshift") {
        let list = trendshiftRepos.map((r, idx) => ({
          position: idx + 1,
          source: "Trendshift",
          repoPath: parseRepoPath(r.githubUrl) || parseRepoPath(r.name),
          ...r,
        }));
        if (limit && list.length > limit) {
          list = list.slice(0, limit);
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                source: "Trendshift Scraper",
                period,
                language: language || "All",
                count: list.length,
                repositories: list,
              }, null, 2),
            },
          ],
        };
      }
    }

    if (name === "get_repo_details") {
      let repoPathOrId = (args.repoPathOrId || "").trim();
      
      // Standardize full Trendshift URL to path
      if (repoPathOrId.startsWith("http://") || repoPathOrId.startsWith("https://")) {
        try {
          const url = new URL(repoPathOrId);
          if (url.hostname === "trendshift.io" && url.pathname.startsWith("/repositories/")) {
            repoPathOrId = url.pathname;
          }
        } catch (e) {
          // ignore
        }
      }

      // If it is a digital ID or starts with /repositories, it's a Trendshift detail lookup
      const isTrendshiftId = /^\d+$/.test(repoPathOrId) || repoPathOrId.startsWith("/repositories/");
      
      if (isTrendshiftId) {
        const cleanPath = repoPathOrId.startsWith("/repositories/")
          ? repoPathOrId
          : `/repositories/${repoPathOrId}`;
          
        // Validate Trendshift input format strictly to prevent Path Traversal / SSRF
        if (!/^\/repositories\/\d+$/.test(cleanPath)) {
          throw new Error(`Invalid Trendshift repository path or ID format: ${repoPathOrId}`);
        }
        
        const targetUrl = `https://trendshift.io${cleanPath}`;
        
        const response = await fetch(targetUrl, {
          signal: AbortSignal.timeout(15000),
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status} from Trendshift`);
        }
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const title = $("h1").text().trim();
        const description = $("p.text-muted-foreground").first().text().trim();
        
        let githubUrl = "";
        $('a[href^="https://github.com/"]').each((_, el) => {
          const href = $(el).attr("href");
          if (href && !githubUrl) {
            const parsed = parseRepoPath(href);
            // Ensure the URL is a valid repository (owner/name) rather than a profile link
            if (parsed && parsed.includes("/")) {
              githubUrl = href;
            }
          }
        });
        
        const stats = {};
        $(".tabular-nums").each((idx, el) => {
          const val = $(el).text().trim();
          const label = $(el).parent().text().replace(val, "").trim();
          if (label.toLowerCase().includes("star")) stats.stars = val;
          else if (label.toLowerCase().includes("fork")) stats.forks = val;
        });
        
        const topics = [];
        $('a[href^="/topics/"]').each((_, el) => {
          topics.push($(el).text().trim().replace("#", ""));
        });
        
        const mentions = [];
        $('a[href*="news.ycombinator.com"], a[href*="twitter.com"], a[href*="x.com"], a[href*="reddit.com"]').each((_, el) => {
          const href = $(el).attr("href");
          const text = $(el).text().trim();
          let source = "Unknown";
          
          if (href.includes("ycombinator.com")) source = "Hacker News";
          else if (href.includes("twitter.com") || href.includes("x.com")) source = "X/Twitter";
          else if (href.includes("reddit.com")) source = "Reddit";
          
          mentions.push({
            source,
            url: href,
            label: text || null,
          });
        });
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                source: "Trendshift",
                url: targetUrl,
                title,
                githubUrl,
                description,
                stats,
                topics,
                mentions,
              }, null, 2),
            },
          ],
        };
      } else {
        // It's a GitHub repo path (owner/name)
        const path = parseRepoPath(repoPathOrId);
        
        // Validate GitHub repository path strictly to prevent Path Traversal / SSRF
        if (!path || !/^[a-zA-Z0-9-_\.]+\/[a-zA-Z0-9-_\.]+$/.test(path)) {
          throw new Error(`Invalid GitHub repository path format: ${repoPathOrId}`);
        }
        
        const [owner, name] = path.split("/");
        const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN || "";
        const headers = {
          "User-Agent": "github-trending-socratic-mcp",
          ...(token ? { "Authorization": `token ${token}` } : {}),
        };

        // 1. Fetch Repository Metadata from GitHub API
        const metaResponse = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
          headers,
          signal: AbortSignal.timeout(10000),
        });
        
        let metadata = null;
        if (metaResponse.ok) {
          metadata = await metaResponse.json();
        } else if (metaResponse.status === 403) {
          console.warn("GitHub API rate limit hit or forbidden");
        } else {
          console.warn(`GitHub API returned status ${metaResponse.status}`);
        }

        // 2. Fetch README Content
        let readmeContent = "";
        let readmeFetched = false;

        // Try API first
        try {
          const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${name}/readme`, {
            headers: {
              ...headers,
              "Accept": "application/vnd.github.raw",
            },
            signal: AbortSignal.timeout(10000),
          });
          
          if (readmeResponse.ok) {
            readmeContent = await readmeResponse.text();
            readmeFetched = true;
          }
        } catch (e) {
          console.warn(`Failed fetching README via API: ${e.message}`);
        }

        // If API fails (e.g. rate limit), try raw fallbacks
        if (!readmeFetched) {
          const branches = ["main", "master"];
          for (const branch of branches) {
            try {
              const rawResponse = await fetch(`https://raw.githubusercontent.com/${owner}/${name}/${branch}/README.md`, {
                signal: AbortSignal.timeout(8000),
              });
              if (rawResponse.ok) {
                readmeContent = await rawResponse.text();
                readmeFetched = true;
                break;
              }
            } catch (e) {
              // try next
            }
          }
        }

        // Format result
        const result = {
          source: "GitHub API/Raw",
          repoPath: path,
          name: metadata?.name || name,
          owner: metadata?.owner?.login || owner,
          description: metadata?.description || null,
          stars: metadata?.stargazers_count || null,
          forks: metadata?.forks_count || null,
          language: metadata?.language || null,
          license: metadata?.license?.name || null,
          readme: readmeContent ? readmeContent.substring(0, 15000) : "No README content resolved.", // Cap to 15k characters for token budget
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Run server using stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("GitHub Trending MCP server running on stdio transport");

