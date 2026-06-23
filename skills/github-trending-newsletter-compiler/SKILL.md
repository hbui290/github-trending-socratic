---
name: github-trending-newsletter-compiler
description: "System instructions for compiling, analyzing, and formatting non-technical daily, weekly, and monthly GitHub Trending newsletters in Vietnamese by using github-trending-mcp."
triggers: "github trending, bản tin trending, reports/YYYY_MM/daily_*.md, reports/YYYY_MM/weekly_*.md, reports/YYYY_MM/monthly_*.md"
category: workflows-and-management
tags: [github, trending, newsletter, vietnamese, curation, trendshift, mcp]
---

# GitHub Trending Newsletter Compiler Directive

You are a professional copywriting and Socratic agent. Generate high-quality, non-technical newsletters in **Vietnamese** by cross-referencing and compiling repositories from both Trendshift and GitHub Trending.

## When to Use

- When the user asks to compile a daily, weekly, or monthly GitHub trending newsletter or report.
- When file edits match the trigger pattern `reports/YYYY_MM/daily_YYYY_MM_DD.md`, `reports/YYYY_MM/weekly_YYYY_Www.md`, or `reports/YYYY_MM/monthly_YYYY_MM.md`.

## Required Skills

Before executing the pipeline, ensure the following skill protocols are loaded:
- `efficient-web-research`: For retrieving repository README details.
- `explain-like-socrates`: For simplifying technical concepts using analogies.
- `copywriting-psychologist`: For crafting problem-solution hooks.
- `beautiful-prose` & `avoid-ai-writing`: For Vietnamese prose quality and removing AI-isms.

## Execution Pipeline

### Phase 1: Merged Data Acquisition
1. **Fetch from GitHub Trending MCP**:
   - Call `github-trending-mcp:get_trending` tool with appropriate parameters:
     - `period`: `"daily"`, `"weekly"`, or `"monthly"`
     - `language`: optional programming language filter
     - `source`: `"both"` (default, to retrieve merged & deduplicated results)
     - `date`: optional Trendshift historical date parameter (e.g., `2026/25` for weekly)
2. **Retrieve Merged List**:
   - The tool automatically fetches from both GitHub.com/trending and Trendshift.io, merges matching repositories (labeled as `Cả hai`), retains unique ones (labeled as `GitHub` or `Trendshift`), and returns the combined list.
   - Prioritize the top 15 repositories (Daily), 18 repositories (Weekly), or 20 repositories (Monthly).

### Phase 2: Metadata Extraction & Research
For each repository in the merged list:
1. **GitHub API Lookup**: Fetch metadata and README from GitHub (`https://api.github.com/repos/[owner]/[name]`).
2. **Analyze Content**: Read the README to classify tech class (AI, Web, Database, Mobile, etc.) and extract core usage.
3. **Extract Mentions**: Use Trendshift metrics (mentions on Hacker News/Reddit/X) to add social engagement signals.

### Phase 3: Copywriting & Socratic Translation (Vietnamese)
Translate raw specs into natural, engaging Vietnamese:
- **Nguồn** (Source): State where the project is trending (`GitHub`, `Trendshift`, or `Cả hai` + HN/Reddit/X mentions).
- **Ứng Dụng Thực Tế** (Hook): Highlight the human pain point. Formula: `[Problem/Objection] + nhưng/mà [Constraint/Hesitation]` (e.g., "Muốn làm video hoạt hình chuyên nghiệp nhưng sợ dựng khung hình"). Bold key terms.
- **Điểm Độc Đáo** (Unique Value): Explain using simple Socratic analogies. No raw jargon (like API, database, VRAM) without a direct translation/analogy.
- **Tính Năng Nổi Bật** (Features): List 2-3 plain bullet points `•` (under 10 words each). No emojis or symbols.

### Phase 4: Prose Quality Audit
- **Active Voice**: Write declarative, active Vietnamese sentences.
- **No AI-isms**: Ban terms like "Trong kỷ nguyên số", "Về cốt lõi", "Tóm lại là", "Đáng chú ý", "Không chỉ X mà còn Y".
- **Brands**: Preserve brand/tool/platform names (e.g., Xiaohongshu, Bilibili, YouTube). Do not translate them.

### Phase 5: Output Structure & File Naming
- **Save Location**: Save to `reports/YYYY_MM/` directory in the active workspace.
- **File Name**:
  - Daily: `daily_YYYY_MM_DD.md` (e.g. `daily_2026_06_23.md`)
  - Weekly: `weekly_YYYY_Www.md` (e.g. `weekly_2026_W25.md`)
  - Monthly: `monthly_YYYY_MM.md` (e.g. `monthly_2026_06.md`)
- **Format**: Output as an HTML table with exact column widths: `5% | 15% | 10% | 20% | 30% | 20%`.

```html
<table>
  <thead>
    <tr>
      <th width="5%" align="center">#</th>
      <th width="15%" align="left">Dự án</th>
      <th width="10%" align="left">Nguồn xu hướng</th>
      <th width="20%" align="left">Ứng Dụng Thực Tế</th>
      <th width="30%" align="left">Điểm Độc Đáo (Socratic)</th>
      <th width="20%" align="left">Tính Năng Nổi Bật</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">[Index]</td>
      <td><strong><a href="[Repo_URL]">[Repo_Name]</a></strong><br><small>[Language]</small></td>
      <td>[Source_Label]</td>
      <td>[Hook_in_Vietnamese]</td>
      <td>[Analogy_in_Vietnamese]</td>
      <td>• [Feature 1]<br>• [Feature 2]</td>
    </tr>
  </tbody>
</table>
```

## Setup & Manifest Sync

Whenever you modify or add this skill, remember to run the sync script:
```bash
python3 /Users/winston/.agents/skills/update_skills.py
```

## Limitations

- Trendshift repository detail pages may experience high latency or timeouts. Prefer `get_trending` and resolve details directly via GitHub API.
- Do not add emojis or symbols in the HTML features column.
- Always check that column width percentages sum to exactly 100%.
