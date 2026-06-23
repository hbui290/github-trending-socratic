import * as cheerio from "cheerio";

// Helper to convert language to GitHub URL slug
function getGitHubLangSlug(lang) {
  if (!lang) return "";
  const lower = lang.toLowerCase().trim();
  if (lower === "c++") return "c%2B%2B";
  if (lower === "c#") return "c%23";
  if (lower === "jupyter notebook") return "jupyter-notebook";
  return encodeURIComponent(lower);
}

// Scrape GitHub Trending HTML
async function fetchGitHubTrending(period, language) {
  const langSlug = getGitHubLangSlug(language);
  const since = period === "weekly" ? "weekly" : period === "monthly" ? "monthly" : "daily";
  const targetUrl = `https://github.com/trending${langSlug ? '/' + langSlug : ''}?since=${since}`;
  
  console.log(`Fetching GitHub Trending from: ${targetUrl}`);
  const response = await fetch(targetUrl, {
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
}

// Build Trendshift URL
function buildTrendshiftUrl(period, language, date) {
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
async function fetchTrendshiftTrending(period, language, date) {
  const targetUrl = buildTrendshiftUrl(period, language, date);
  console.log(`Fetching Trendshift from: ${targetUrl}`);
  
  const response = await fetch(targetUrl, {
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
  
  const repos = [];
  $('a[href^="/repositories/"]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href === "/repositories" || href === "/repositories/") return;
    
    const pathParts = href.split("/");
    if (pathParts.length !== 3) return;
    
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
}

// Helper to parse repo owner/name
function parseRepoPath(str) {
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
  }
  if (str.includes("/") && !str.includes(" ")) {
    const parts = str.split("/").filter(Boolean);
    if (parts.length === 2) {
      return `${parts[0]}/${parts[1]}`;
    }
  }
  return str.trim();
}

async function test() {
  console.log("--- TEST 1: GitHub Scraper ---");
  const ghRepos = await fetchGitHubTrending("daily", "");
  console.log(`Fetched ${ghRepos.length} repos from GitHub Trending.`);
  if (ghRepos.length > 0) {
    console.log("First GitHub Repo:", JSON.stringify(ghRepos[0], null, 2));
  } else {
    throw new Error("GitHub scraping failed, returned 0 results");
  }

  console.log("\n--- TEST 2: Trendshift Scraper ---");
  const tsRepos = await fetchTrendshiftTrending("daily", "", "");
  console.log(`Fetched ${tsRepos.length} repos from Trendshift.`);
  if (tsRepos.length > 0) {
    console.log("First Trendshift Repo:", JSON.stringify(tsRepos[0], null, 2));
  } else {
    throw new Error("Trendshift scraping failed, returned 0 results");
  }

  console.log("\n--- TEST 3: Merged Results ---");
  const mergedMap = new Map();
  const orderedPaths = [];

  for (const gr of ghRepos) {
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

  for (const tr of tsRepos) {
    const path = parseRepoPath(tr.githubUrl) || parseRepoPath(tr.name);
    if (!path) continue;

    const key = path.toLowerCase();
    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key);
      mergedMap.set(key, {
        ...existing,
        source: "Cả hai",
        trendshiftUrl: tr.trendshiftUrl || existing.trendshiftUrl,
        author: tr.author || existing.author,
        keywords: tr.keywords && tr.keywords.length > 0 ? tr.keywords : existing.keywords,
        description: existing.description || tr.description || null,
      });
    } else {
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

  const mergedList = orderedPaths.map((key, index) => ({
    position: index + 1,
    ...mergedMap.get(key),
  }));

  console.log(`Merged total: ${mergedList.length} repos.`);
  const bothCount = mergedList.filter(r => r.source === "Cả hai").length;
  const ghCount = mergedList.filter(r => r.source === "GitHub").length;
  const tsCount = mergedList.filter(r => r.source === "Trendshift").length;
  console.log(`Breakdown -> Cả hai: ${bothCount}, GitHub Only: ${ghCount}, Trendshift Only: ${tsCount}`);
  
  if (mergedList.length > 0) {
    console.log("Sample Merged Repo:", JSON.stringify(mergedList[0], null, 2));
  }
  
  console.log("\nALL TESTS PASSED SUCCESSFULLY! ✅");
}

test().catch(err => {
  console.error("Test failed: ", err);
  process.exit(1);
});
