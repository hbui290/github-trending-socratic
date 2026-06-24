---
name: github-trending-layout-spec
description: "Quy chuẩn kỹ thuật, cấu trúc bố cục HTML và định dạng tệp tin cho việc xuất bản bản tin xu hướng công nghệ."
risk: safe
source: original
date_added: "2026-06-23"
---

# GITHUB TRENDING LAYOUT SPEC

Defines the technical specifications, HTML layout constraints, output directory structure, and linter validation rules for publishing the technology trending newsletter. This specification acts as a strict format compliance checker to ensure visual excellence across all client devices.

DO:
- Enforce exact column width percentages in the table header.
- Align column content according to the alignment spec (e.g. center for rank `#`, left for others).
- Wrap the repository names inside bold anchor links (`<strong><a href="...">`).
- Format the programming language tag below the repository name in a small font (`<small>`).
- Place reports in the correct month directory (`reports/YYYY_MM/`).
- Name reports strictly based on period types (`daily_YYYY_MM_DD.md`, `weekly_YYYY_Www.md`, `monthly_YYYY_MM.md`).
- Ensure all HTML tags (such as `<strong>`, `<a>`, `<small>`, `<br>`) are properly closed.

DO NOT:
- Change column width percentages or column orders.
- Add emojis or decorated special characters inside the highlighted features column.
- Omit closing tags, which would break layout rendering.
- Output draft files outside the designated monthly directory.

---

## When to Use
Use this skill when the assistant is:
- Preparing the empty HTML table structure for the newsletter.
- Mapping scraped metadata (such as rank, repository path, description, programming language, social mentions, copywriting hooks) into HTML table rows.
- Saving the finished newsletter document to disk.
- Linting and verifying the HTML table structure before publishing.

Do NOT Use this skill when:
- Scraping raw trending listings from sources (use `get_trending` and `get_repo_details` tools).
- Drafting copy or writing Socratic metaphors (use copywriting and explain-like-socrates skills).

---

# SPECIFICATION

The publication layout must strictly comply with the following mapping and template schemas.

## 1. Data Mapping Schema

The output HTML table consists of exactly 5 columns mapped as follows:

*   **Column 1: `#` (width: 5%)**
    - Content: Project rank index.
    - Alignment: Centered.
*   **Column 2: `Dự án` (width: 10%)**
    - Content: Bold repository name wrapped in a GitHub link, followed by main programming language in small text.
    - Format: `<strong><a href="[GitHub_URL]">[Tên_Repo]</a></strong><br><small>[Ngôn_Ngữ]</small>`
    - Alignment: Left.
*   **Column 3: `Ứng Dụng Thực Tế` (width: 20%)**
    - Content: User pain points and solution hook.
    - Alignment: Left.
*   **Column 4: `Điểm Độc Đáo (Socratic)` (width: 35%)**
    - Content: Structured Socratic metaphor and technical mechanism.
    - Format: `<strong>[Tên_Ẩn_Dụ]</strong> - [Giải thích ẩn dụ]<br><strong>CƠ CHẾ KỸ THUẬT</strong>: [Giải thích cơ chế hoạt động thực tế]`
    - Alignment: Left.
*   **Column 5: `Tính Năng Nổi Bật` (width: 30%)**
    - Content: 2-3 bulleted features using standard solid black bullets (`•`). No emojis.
    - Alignment: Left.

---

## 2. HTML Table Template

```html
<table>
  <thead>
    <tr>
      <th width="5%" align="center">#</th>
      <th width="10%" align="left">Dự án</th>
      <th width="20%" align="left">Ứng Dụng Thực Tế</th>
      <th width="35%" align="left">Điểm Độc Đáo (Socratic)</th>
      <th width="30%" align="left">Tính Năng Nổi Bật</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">[Xếp_Hạng]</td>
      <td><strong><a href="[GitHub_URL]">[Tên_Repo]</a></strong><br><small>[Ngôn_Ngữ]</small></td>
      <td>[Nội_Dung_Hook]</td>
      <td>[Phép_Ẩn_Dụ_Socratic]</td>
      <td>• [Tính năng 1]<br>• [Tính năng 2]</td>
    </tr>
  </tbody>
</table>
```

---

## 3. Storage and File Naming Spec

Save files in monthly folders under `reports/YYYY_MM/` directory:

*   **Daily Reports:** `reports/YYYY_MM/daily_YYYY_MM_DD.md`
*   **Weekly Reports:** `reports/YYYY_MM/weekly_YYYY_Www.md`
*   **Monthly Reports:** `reports/YYYY_MM/monthly_YYYY_MM.md`

### Markdown Heading Spec:
1. The document must start with a level-1 header: `# Bản tin GitHub Trending [ngày DD/MM/YYYY | Tuần WW/YYYY | Tháng MM/YYYY]`.
2. A small subtitle showing the generation time must be placed immediately below the H1: *Thời gian cập nhật: HH:MM, ngày DD/MM/YYYY*.

---

## 4. Validation Rules (Linter)

Perform a final sanity check before writing to disk:
1. **Width Validation:** Ensure the `width` attributes in `<th>` are exactly `5%`, `10%`, `20%`, `35%`, and `30%`.
2. **HTML Parser Check:** Verify that all opening tags (`<strong>`, `<a>`, `<small>`, etc.) have corresponding closing tags.

---

## Limitations
- This skill only defines presentation, structure, validation, and storage rules.
- It does not contain scraper tool invocation schemas or copywriting guidelines.
