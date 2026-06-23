---
name: github-trending-newsletter-compiler
description: "System agent instructions for compiling daily, weekly, and monthly Vietnamese GitHub Trending reports. Directs execution to the local workspace skill."
triggers: "github trending, bản tin trending, reports/YYYY_MM/daily_*.md, reports/YYYY_MM/weekly_*.md, reports/YYYY_MM/monthly_*.md"
category: discipline
---

# GitHub Trending Newsletter Compiler Agent (AGENTS.md)

Chào mừng các AI coding agent (như Claude Code, Cursor, Windsurf, Gemini...) đến với repository này. Đây là hướng dẫn vận hành chuẩn dành cho máy (machine-readable guide) để làm việc hiệu quả với dự án.

---

## 📋 Tổng quan dự án (Project Overview)

Dự án này là hệ thống bán tự động thu thập thông tin xu hướng công nghệ từ **GitHub Trending** và **Trendshift.io**, gộp trùng lặp và biên dịch thành bản tin tiếng Việt phi kỹ thuật.

### Công nghệ sử dụng:
- **Backend / MCP Server:** Node.js (ES Modules), thư viện phân tích cú pháp HTML `cheerio`.
- **Agent Curation:** Markdown, quy trình biên dịch sử dụng Socratic Method và Marketing Psychology.

---

## 🛠️ Các lệnh cốt lõi (Core Commands)

Các Agent khi làm việc trong repository này cần sử dụng đúng các lệnh sau để phát triển và kiểm thử:

*   **Cài đặt thư viện MCP:**
    ```bash
    cd github-trending-mcp && npm install
    ```
*   **Chạy kiểm thử tích hợp MCP (Scraper + Merger):**
    ```bash
    node github-trending-mcp/test_merged_mcp.mjs
    ```
*   **Đồng bộ Skill hệ thống (khi có thay đổi ở file SKILL.md):**
    ```bash
    python3 /Users/winston/.agents/skills/update_skills.py
    ```

---

## ✍️ Hướng dẫn phong cách mã nguồn (Code Style Guidelines)

*   **Node.js (ES Modules):** Sử dụng cú pháp `import/export` tiêu chuẩn, không dùng CommonJS (`require`).
*   **MCP SDK:** Luôn khóa cứng phiên bản `@modelcontextprotocol/sdk` ở bản `1.28.0` trong `package.json` để tránh lỗi nạp module ở các phiên bản mới hơn.
*   **Scraper:** Luôn cấu hình `AbortSignal.timeout(12000)` hoặc tương đương cho các hàm gọi fetch mạng ngoài để tránh treo tiến trình.

---

## 🚫 Các ràng buộc & Ranh giới (Boundaries & Constraints)

*   **Tuyệt đối không track node_modules:** Đảm bảo `github-trending-mcp/node_modules/` luôn bị bỏ qua bởi Git (đã khai báo trong `.gitignore`).
*   **Không dịch tên thương hiệu:** Giữ nguyên các tên riêng như *Hacker News*, *Reddit*, *X/Twitter*, *YouTube*, *Bilibili*, v.v.
*   **Bản dịch phi kỹ thuật:** Không để các từ khóa chuyên ngành thuần kỹ thuật (như VRAM, sandbox, API, database) xuất hiện trong cột "Điểm Độc Đáo" mà không kèm theo phép ẩn dụ trực quan Socratic.
*   **Nghiêm cấm AI-isms (từ ngữ sáo rỗng của AI):** Tuyệt đối không dùng các từ như *"Trong kỷ nguyên số"*, *"Tóm lại là"*, *"Về cốt lõi"*, *"Đáng chú ý"*, *"Không chỉ X mà còn Y"*.

---

## 🔗 Liên kết cấu phần dự án

*   **Quy trình biên dịch chính:** Xem chi tiết quy trình 4 pha tại [github-trending-newsletter-compiler/SKILL.md](file:///Users/winston/Desktop/github-trending-nontech/github-trending-newsletter-compiler/SKILL.md).
*   **Mã nguồn MCP Server:** Đọc tại [github-trending-mcp/index.js](file:///Users/winston/Desktop/github-trending-nontech/github-trending-mcp/index.js).
*   **Các kỹ năng hành văn bổ trợ:** Nằm trong thư mục [skills/](file:///Users/winston/Desktop/github-trending-nontech/skills/).
