import {
  fetchGitHubTrending,
  fetchTrendshiftTrending,
  parseRepoPath,
} from "./utils.js";

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
