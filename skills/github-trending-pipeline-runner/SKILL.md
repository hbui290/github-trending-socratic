---
name: github-trending-pipeline-runner
description: "Orchestrates the entire end-to-end compilation, verification, and deployment pipeline for the Vietnamese Socratic technology newsletter."
risk: safe
source: original
date_added: "2026-06-24"
tags:
  - automation
  - pipeline
  - socratic
  - deployment
  - workflow
tools:
  - trendshift-mcp
  - github-trending-socratic-mcp
---

# GITHUB TRENDING PIPELINE RUNNER

Defines the step-by-step technical procedures to fetch raw trending data, run the research loop, compile the report, audit formatting, and publish the newsletter to GitHub.

---

## When to Use

Use this skill when:
- Compiling daily, weekly, or monthly Vietnamese Socratic newsletter reports.
- Performing git commits, pull requests, and merges for compiled reports.
- Executing the entire publishing pipeline autonomously.

Do NOT use this skill when:
- Simply auditing existing files for style compliance (use `content-reviewer` directly).
- Formatting code or fixing general bugs outside the newsletter pipeline.

---

## Execution Workflow

### Step 1: Data Gathering (Fetch & Cache)
1. Invoke the MCP tool `get_trending` (parameters: `source="both"`, `limit=25`, `period` as requested).
2. For each unique repository returned, call `get_repo_details` to retrieve the README and metadata.
3. Save the raw aggregated output into the temporary cache file:
   `github-trending-socratic-mcp/.temp_trending_data.json`

> **Guardrail:** All subsequent compilation steps must read data ONLY from this cached JSON file. Do not call external API scraping tools after this point.

### Step 2: Socratic Compilation
1. Read the JSON cache from `github-trending-socratic-mcp/.temp_trending_data.json`.
2. Prepare the empty HTML table structure (column widths: `5% | 10% | 20% | 35% | 30%`).
3. For each repository in the cache:
   - Call the `efficient-web-research` skill to analyze the project's README/codebase.
   - Call the `copywriting-psychologist` skill to write the hook for the **Ứng Dụng Thực Tế** column.
   - Call the `explain-like-socrates` skill to write the metaphor and technical mechanism for the **Điểm Độc Đáo** column.
   - Apply the `avoid-ai-writing` and `beautiful-prose` skills to polish the language.
4. Populate the HTML table rows.

### Step 3: Local Quality Gate (Verify)
1. Write the drafted report to its target path (e.g., `reports/2026_06/daily_2026_06_24.md`).
2. Call the `content-reviewer` skill to evaluate the file against the 5-point quality checklist.
3. Run the local validation script:
   ```bash
   node verify_report.js [path/to/report.md]
   ```
4. If validation fails:
   - Identify the non-compliant rows reported by the linter.
   - Rewrite the offending sections.
   - Re-run the validation script.
   - Repeat until the script exits with code `0`.

### Step 4: Publish & Merge (Git Automation)
Once the validation script passes successfully:
1. Create a new git branch:
   ```bash
   git checkout -b feat/newsletter-[date-or-period]
   ```
2. Stage and commit all changes (including the new report and updated files):
   ```bash
   git add .
   git commit -m "feat: compile and verify newsletter for [date-or-period]"
   ```
3. Push the feature branch to remote:
   ```bash
   git push origin feat/newsletter-[date-or-period]
   ```
4. Create a Pull Request via GitHub CLI:
   ```bash
   gh pr create --fill
   ```
5. Merge the PR immediately and delete the remote branch:
   ```bash
   gh pr merge --merge --delete-branch
   ```
6. Delete the temporary JSON cache file `github-trending-socratic-mcp/.temp_trending_data.json` to keep the working tree clean.

---

## Completion Criteria

This skill is successfully executed when:
1. The target report is compiled and saved under `reports/YYYY_MM/`.
2. `node verify_report.js` exits with code `0`.
3. The pull request is merged into the `main` branch.
4. The local and remote branches are fully synchronized and clean.
