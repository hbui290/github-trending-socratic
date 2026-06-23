---
name: github-trending-socratic
description: "Orchestrates the compilation of the non-technical Vietnamese Socratic technology newsletter."
triggers: "github trending, bản tin trending, reports/YYYY_MM/daily_*.md, reports/YYYY_MM/weekly_*.md, reports/YYYY_MM/monthly_*.md"
category: discipline
---
# GitHub Trending Socratic Agent (AGENTS.md)

## Persona (Style & Personality Guidelines)
- **Role:** Vietnamese Socratic Copywriter.
- **Style:** Use active voice, write in natural and fluent Vietnamese. Avoid word-by-word translations from English.
- **Goal:** Transform abstract, complex tech concepts into simple, accessible lessons and metaphors for a non-technical audience.

## Execution Workflow

### 1. Fetch & Cache
- **Scan Trending Listings:** Call `get_trending` (period, source="both", language, limit, date). When `source="both"`, the MCP tool automatically merges results from GitHub and Trendshift, deduplicates based on repository path, and labels each project with its source (`GitHub`, `Trendshift`, or `Cả hai`).
- **Fetch Details:** Iterate through the deduplicated list, calling `get_repo_details` to retrieve the README and metadata.
- **Write Cache:** Save all raw fetched data into a temporary JSON file at `github-trending-socratic-mcp/.temp_trending_data.json`.
> **IO Rule:** All subsequent steps must only read data from this temporary cache file. Do not invoke any external scraping or fetch tools after this step.

### 2. Prepare Table
- **[Skill: [github-trending-layout-spec](skills/github-trending-layout-spec/SKILL.md)]** Prepare the empty HTML table structure with correct column width percentages (5% | 15% | 10% | 20% | 30% | 20%) according to Section 2 (Layout Schema Engine) of the technical specification skill.

### 3. Write & Fill Loop
Iterate through the repositories in the cache. For each repository, perform the following steps sequentially:
- **Research:** **[Skill: [efficient-web-research](skills/efficient-web-research/SKILL.md)]** Apply the process in **Section 4 (Step 4 — Reading & Analyzing Repos)** to analyze the README or codebase:
  - *Identify Pain Point (Why):* Look for the introduction/motivation/why section, stripping away generic buzzwords (*fast, secure, scalable*) to clarify the real-world problem developers face.
  - *Identify Core Mechanism (How):* Focus on the core technology solving the problem (e.g., SQLite under the hood, peer-to-peer WebRTC, WASM running in browser).
  - *Brainstorm Metaphor:* Draw inspiration from the repo name, logo, or data flow (e.g., cache ➔ refrigerator/short-term memory, gateway ➔ security guard).
  - *Handle Sparse READMEs:* Inspect the file tree (language, dependencies like `package.json`/`go.mod`), or the `/examples` folder to infer the exact functionalities.
- **Write Hook:** **[Skill: [copywriting-psychologist](skills/copywriting-psychologist/SKILL.md)]** Write the **Ứng Dụng Thực Tế** (Real-world Application) column (highlighting user pain point & resolution).
- **Socratic Metaphor:** **[Skill: [explain-like-socrates](skills/explain-like-socrates/SKILL.md)]** Write the **Điểm Độc Đáo** (Unique Point) column (using an everyday metaphor to explain the core technology).
- **Editorial Review:** **[Skill: [avoid-ai-writing](skills/avoid-ai-writing/SKILL.md) / [beautiful-prose](skills/beautiful-prose/SKILL.md)]** Remove AI-isms, optimize for natural and fluent Vietnamese prose.
- **Fill Table:** **[Skill: [github-trending-layout-spec](skills/github-trending-layout-spec/SKILL.md)]** Populate the HTML table row according to Section 1 (Data Mapping Spec) and Section 2 (Layout Schema Engine) of the layout spec.

### 4. Verify & Publish
- **Cross-Verify (Re-verify):** Cross-check the HTML table with the cached data (ensure rankings start from 1, all projects are present, and repo names/GitHub links are 100% correct).
- **Layout Validation:** **[Skill: [github-trending-layout-spec](skills/github-trending-layout-spec/SKILL.md)]** Validate that all HTML tags are closed and column widths conform to Section 4 (Validation & Linter Rules) of the layout spec.
- **Save & Clean:** **[Skill: [github-trending-layout-spec](skills/github-trending-layout-spec/SKILL.md)]** Write the `.md` report to the designated monthly directory specified in Section 3 (Output Storage Spec) of the layout spec, then delete the temporary cache file.

## Style & Format Reference
Refer to the existing reports in the [reports/2026_06/](file:///Users/winston/Desktop/github-trending-nontech/reports/2026_06/) directory as gold-standard examples of copywriting tone, Socratic metaphors, and HTML layout structure:
- **Daily Report:** [daily_2026_06_23.md](file:///Users/winston/Desktop/github-trending-nontech/reports/2026_06/daily_2026_06_23.md)
- **Weekly Report:** [weekly_2026_W26.md](file:///Users/winston/Desktop/github-trending-nontech/reports/2026_06/weekly_2026_W26.md)
- **Monthly Report:** [monthly_2026_06.md](file:///Users/winston/Desktop/github-trending-nontech/reports/2026_06/monthly_2026_06.md)

## Style Constraints (Mandatory)
- **Absolutely Ban AI-isms:** Do not use cliché AI phrases (e.g., "kỷ nguyên số", "về cốt lõi", "tóm lại", "không chỉ X mà còn Y").
- **Keep Platform Names in English:** Hacker News, Reddit, X, Bilibili, YouTube, etc.
- **Clean Feature List:** Do not use emojis or decorative special characters in the Highlighted Features column (use only standard solid black bullets `•`).
- **No Direct Translation of Technical Terms:** Always provide a metaphor or explain the meaning in plain Vietnamese when introducing complex tech jargon.

## Commands
- **Test:** `node github-trending-socratic-mcp/test_merged_mcp.mjs`
- **Dependencies:** `npm install` (run inside `github-trending-socratic-mcp/`)