import * as cheerio from "cheerio";

// Helper to convert language to GitHub URL slug
export function getGitHubLangSlug(lang) {
  if (!lang) return "";
  const lower = lang.toLowerCase().trim();
  if (lower === "c++") return "c%2B%2B";
  if (lower === "c#") return "c%23";
  if (lower === "jupyter notebook") return "jupyter-notebook";
  return encodeURIComponent(lower);
}

// Scrape GitHub Trending HTML
export async function fetchGitHubTrending(period, language) {
  const langSlug = getGitHubLangSlug(language);
  const since = period === "weekly" ? "weekly" : period === "monthly" ? "monthly" : "daily";
  const targetUrl = `https://github.com/trending${langSlug ? '/' + langSlug : ''}?since=${since}`;
  
  try {
    const response = await fetch(targetUrl, {
      signal: AbortSignal.timeout(12000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} from GitHub Trending`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const repos = [];
    
    $("article.Box-row").each((idx, el) => {
      const pathElement = $(el).find("h2.h3 a");
      const href = pathElement.attr("href") || "";
      const repoPath = href.replace(/^\//, "").trim();
      if (!repoPath) return;
      
      const description = $(el).find("p.col-9").text().trim();
      const starsText = $(el).find(`a[href$="${href}/stargazers"]`).text().trim().replace(/,/g, "");
      const forksText = $(el).find(`a[href$="${href}/forks"]`).text().trim().replace(/,/g, "");
      const progLang = $(el).find("span[itemprop='programmingLanguage']").text().trim();
      const starsAdded = $(el).find("span.float-sm-right, span.d-inline-block.float-sm-right").text().trim();
      
      repos.push({
        repoPath,
        name: repoPath,
        description: description || null,
        stars: starsText ? parseInt(starsText, 10) : null,
        forks: forksText ? parseInt(forksText, 10) : null,
        language: progLang || null,
        starsAdded: starsAdded || null,
        githubUrl: `https://github.com/${repoPath}`
      });
    });
    
    return repos;
  } catch (error) {
    console.error(`Error fetching GitHub Trending: ${error.message}`);
    return [];
  }
}

// Build Trendshift URL
export function buildTrendshiftUrl(period, language, date) {
  let baseUrl = "https://trendshift.io";
  
  if (period === "weekly") {
    baseUrl += date ? `/weekly/${date}` : "/weekly";
  } else if (period === "monthly") {
    baseUrl += date ? `/monthly/${date}` : "/monthly";
  } else if (period === "yearly") {
    baseUrl += date ? `/yearly/${date}` : "/yearly";
  }
  
  const params = new URLSearchParams();
  if (language) {
    params.set("language", language);
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// Fetch and scrape Trendshift.io
export async function fetchTrendshiftTrending(period, language, date) {
  const targetUrl = buildTrendshiftUrl(period, language, date);
  
  try {
    const response = await fetch(targetUrl, {
      signal: AbortSignal.timeout(12000),
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
    
    // Parse using JSON-LD script (primary)
    let itemList = null;
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).text().trim());
        if (json["@type"] === "ItemList") {
          itemList = json;
        }
      } catch (e) {
        // ignore
      }
    });
    
    if (itemList && itemList.itemListElement) {
      return itemList.itemListElement.map((element) => {
        const item = element.item || {};
        return {
          position: element.position,
          trendshiftUrl: element.url,
          name: item.name,
          description: item.description,
          githubUrl: item.codeRepository,
          language: item.programmingLanguage,
          dateCreated: item.dateCreated,
          dateModified: item.dateModified,
          author: item.author ? item.author.name : null,
          keywords: item.keywords || [],
        };
      });
    }
    
    // Fallback: Parse using CSS selectors
    const repos = [];
    $('a[href^="/repositories/"]').each((_, el) => {
      const href = $(el).attr("href");
      if (!href || href === "/repositories" || href === "/repositories/") return;
      
      const pathParts = href.split("/");
      if (pathParts.length !== 3) return; // must be /repositories/id
      
      const repoName = $(el).text().trim();
      if (!repoName) return;
      
      const parentRow = $(el).closest(".group, .hover\\:bg-accent, tr, li");
      let description = "";
      let starsText = "";
      let tags = [];
      
      if (parentRow.length > 0) {
        description = parentRow.find("p.text-muted-foreground").text().trim();
        starsText = parentRow.find(".tabular-nums, [aria-label*='star']").text().trim();
        
        parentRow.find('a[href^="/topics/"]').each((_, tagEl) => {
          tags.push($(tagEl).text().trim().replace("#", ""));
        });
      }
      
      repos.push({
        trendshiftUrl: `https://trendshift.io${href}`,
        name: repoName,
        description: description || null,
        starsText: starsText || null,
        keywords: tags,
      });
    });
    
    // Deduplicate repos by name
    const uniqueRepos = [];
    const seen = new Set();
    for (const r of repos) {
      if (!seen.has(r.name)) {
        seen.add(r.name);
        uniqueRepos.push(r);
      }
    }
    
    return uniqueRepos.map((r, idx) => ({
      position: idx + 1,
      ...r,
    }));
  } catch (error) {
    console.error(`Error fetching Trendshift: ${error.message}`);
    return [];
  }
}

// Helper to parse repo owner/name from strings or URLs
export function parseRepoPath(str) {
  if (!str) return null;
  if (str.startsWith("http://") || str.startsWith("https://")) {
    try {
      const url = new URL(str);
      if (url.hostname === "github.com") {
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length >= 2) {
          return `${parts[0]}/${parts[1]}`;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  }
  if (str.includes("/") && !str.includes(" ")) {
    const parts = str.split("/").filter(Boolean);
    if (parts.length === 2) {
      return `${parts[0]}/${parts[1]}`;
    }
  }
  return str.trim();
}
