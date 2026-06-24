---
name: github-trending-socratic
description: "Orchestrates the compilation of the non-technical Vietnamese Socratic technology newsletter."
triggers: "github trending, bản tin trending, reports/YYYY_MM/daily_*.md, reports/YYYY_MM/weekly_*.md, reports/YYYY_MM/monthly_*.md"
category: discipline
---
# GitHub Trending Socratic Agent ([AGENTS.md](http://AGENTS.md))

## Persona (Style & Personality Guidelines)

- **Role:** Vietnamese Socratic Copywriter for non-technical audiences.
- **Style:** Use active voice, write in natural, fluent Vietnamese. Avoid clumsy, word-by-word literal translations from English.
- **Goal:** Transform abstract, complex tech concepts into simple, accessible lessons and metaphors without losing the underlying technical substance.

## Execution Workflow

### 1. Fetch & Cache

- **Scan Trending Listings:** Call `get_trending` (period, source="both", language, limit=25, date). When `source="both"`, the MCP tool automatically merges results from GitHub and Trendshift, deduplicates based on repository path, and labels each project with its source (`GitHub`, `Trendshift`, or `Cả hai`).
- **Fetch Details:** Iterate through the deduplicated list, calling `get_repo_details` to retrieve the README and metadata.
- **Write Cache:** Save all raw fetched data into a temporary JSON file at `github-trending-socratic-mcp/.temp_trending_data.json`.

> **IO Rule:** All subsequent steps must only read data from this temporary cache file. Do not invoke any external scraping or fetch tools after this step.

### 2. Prepare Table

- **\[Skill: github-trending-layout-spec\]** Prepare the empty HTML table structure with correct column width percentages (5% | 10% | 20% | 35% | 30%) according to Section 2 of the layout spec.

### 3. Write & Fill Loop

Iterate through the repositories in the cache. For each repository, perform the following steps sequentially:

- **Research:** **\[Skill: efficient-web-research\]** Analyze the README or codebase:
  - *Identify Pain Point (Why):* Find the motivation section, stripping away generic buzzwords (*fast, secure, scalable*) to clarify the real-world problem developers face.
  - *Identify Core Mechanism (How):* Focus on the core technology (e.g., C binary, SQLite under the hood, GitHub Actions workflows, Local LLM, sandbox, MCP server).
  - *Brainstorm Metaphor:* Draw inspiration from the repo name, logo, or data flow (e.g., cache ➔ refrigerator, gateway ➔ security guard, codebase memory ➔ map).
- **Write Hook:** **\[Skill: copywriting-psychologist\]** Write the **Ứng Dụng Thực Tế** column.
- **Socratic Metaphor:** **\[Skill: explain-like-socrates\]** Write the **Điểm Độc Đáo (Socratic)** column.
- **Editorial Review:** **\[Skill: avoid-ai-writing / beautiful-prose\]** Remove AI-isms and optimize for natural, fluent tech Vietnamese.
- **Fill Table:** Populate the HTML table row according to Section 1 and Section 2 of the layout spec.

### 4. Verify & Publish (Quality Gate)

- **Pre-Publish Gate (Fact-Forcing):** **\[Skill: content-reviewer\]** Before saving the final `.md` report, the agent must execute the verification checks (using a local validation script like `verify_report.js` or a systematic row-by-row manual check).
- **Strict Verification Rubric:**
  - Check that rankings start from 1 to 25.
  - Ensure all 25 projects are present and repo paths/GitHub URLs are 100% correct.
  - Ensure every copywriting hook strictly uses the pattern: `<strong>Muốn/Cần [mục tiêu]</strong> nhưng <strong>ngại/sợ/lo ngại [rào cản]</strong>.`
  - Ensure every Socratic metaphor includes the bold title, life analogy, and `<strong>CƠ CHẾ KỸ THUẬT</strong>:` pointing to concrete codebase implementations.
  - Check that the featured list contains only solid black bullets (`•`) and no emojis.
- **Gate Enforcement (Deny/Allow):** If any check fails, the agent must *deny* the save operation, log the exact failed ranks and formatting errors, rewrite the non-compliant rows, and re-run the verification. Saving the file is only *allowed* once 100% of the checklist items pass.
- **Save & Clean:** Write the validated `.md` report to the designated monthly directory specified in Section 3 of the layout spec, then delete the temporary cache file.

## Style & Format Reference

Refer to the existing reports in the reports/2026_06/ directory as gold-standard examples of copywriting tone, Socratic metaphors, and HTML layout structure:

- **Daily Report:** daily_2026_06_24.md
- **Weekly Report:** weekly_2026_W26.md
- **Monthly Report:** monthly_2026_06.md

## Style Constraints (Mandatory)

### 1. Structure of Copywriting Hooks (Ứng Dụng Thực Tế)

Must strictly follow the pattern: `<strong>Muốn/Cần [mục tiêu]</strong> nhưng <strong>ngại/sợ/lo ngại [rào cản]</strong>.`*Example:* `<strong>Muốn làm video ngắn, TikTok</strong> nhưng <strong>ngại khâu dựng clip, lồng tiếng mất thời gian</strong>.`

### 2. Technically Grounded Metaphors (Điểm Độc Đáo)

Always bridge the everyday metaphor with the actual codebase implementation (referencing C binary, desktop app, prompt configurations, GitHub Actions, sandboxes, local LLMs, MCP servers, etc.) so that it is realistic and not make-believe. Must strictly follow the format: `<strong>[Tên_Ẩn_Dụ]</strong> - [Mô tả ẩn dụ cuộc sống dễ hiểu]<br><strong>CƠ CHẾ KỸ THUẬT</strong>: [Mô tả cơ chế hoạt động thực tế dưới codebase]`*Example:* `<strong>Nhà phân tích tài chính túc trực</strong> - Tự động gom tin tức, vẽ biểu đồ phân tích và gửi báo cáo về chat cá nhân hằng ngày.<br><strong>CƠ CHẾ KỸ THUẬT</strong>: Code chạy tự động (cron job) qua GitHub Actions, dùng LLM phân tích market data đa nguồn rồi tự động tạo dashboard và gửi tin nhắn Webhook.`

### 3. Natural Tech Jargon Balance (Loanword vs Translation)

- **Keep in English:** Do not translate standard tech terms commonly used in the Vietnamese developer community. Leave them in English: *AI*, *agent*, *subagent*, *dev*, *prompt*, *script*, *code*, *local*, *offline*, *cloud*, *LLM*, *VLM*, *RAG*, *embedding*, *Next.js*, *GitHub Actions*, *dashboard*, *sandbox*, *desktop app*, *MCP*, *JSON/Markdown*, *OSINT*, *token*, *video editor*, *toolchain*, *research*, *voiceover*, *audit*, *reverse-engineer*, *reverse-engineering*, *scene*, *subtitle*, *cron job*, *Webhook*, *Cursor*, *CLI*, *QA*, *Neural Engine*, *Apple Silicon*, *vibe coding*, *agentic engineering*, *meta-skill*, *voice I/O stack*, *HTML/CSS*, *knowledge graph*, *rules/instincts*, *context*, *capsule*, *WebAssembly (Wasm)*, *IPC*, *ambient authority*, *Playwright*, *Selenium*, *stealth engine*, *YAML front-matter*, *Markdown prose*, *CTF*.
- **Translate to Natural Vietnamese:** Translate generic business or layout nouns/verbs into idiomatic, active-voice Vietnamese instead of literal word-for-word translations. Do not make up formal Vietnamese tech terms if English terms are already widely understood.

### 4. General Formatting Constraints

- **Absolutely Ban AI-isms:** Do not use cliché AI phrases (e.g., "kỷ nguyên số", "về cốt lõi", "tóm lại", "không chỉ X mà còn Y").
- **Clean Feature List:** Do not use emojis or decorative special characters in the Highlighted Features column (use only standard solid black bullets `•`).
- **Keep Platform Names in English:** Hacker News, Reddit, X, Bilibili, YouTube, Y Combinator, Apple Silicon, etc.

## Commands

- **Test:** `node github-trending-socratic-mcp/test_merged_mcp.mjs`
- **Dependencies:** `npm install` (run inside `github-trending-socratic-mcp/`)