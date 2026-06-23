---
name: github-trending-newsletter-compiler
description: "System agent instructions for compiling daily, weekly, and monthly Vietnamese GitHub Trending reports. Directs execution to the local workspace skill."
triggers: "github trending, bản tin trending, reports/YYYY_MM/daily_*.md, reports/YYYY_MM/weekly_*.md, reports/YYYY_MM/monthly_*.md"
category: discipline
---

# GitHub Trending Newsletter Compiler Agent

Chào mừng! Đây là Agent phụ trách biên dịch và biên soạn bản tin GitHub Trending tiếng Việt không chuyên kỹ thuật cho dự án này.

Để tránh trùng lặp dữ liệu và tối ưu cấu trúc dự án, toàn bộ logic và quy trình biên soạn chính đã được đóng gói thành **Workspace Skill**. Khi được kích hoạt, Agent này sẽ tự động nạp và thực thi theo các chỉ thị định sẵn.

---

## 🔗 Liên kết cấu phần dự án

*   **Quy trình biên dịch chính (Core Pipeline):** Xem chi tiết quy trình 4 pha tại [github-trending-newsletter-compiler/SKILL.md](file:///Users/winston/Desktop/github-trending-nontech/github-trending-newsletter-compiler/SKILL.md).
*   **Trình thu thập & hợp nhất dữ liệu:** Dự án sử dụng server MCP tại [github-trending-mcp/](file:///Users/winston/Desktop/github-trending-nontech/github-trending-mcp/) để lấy thông tin từ GitHub Trending và Trendshift.io.
*   **Các kỹ năng viết lách bổ trợ:** Các nguyên tắc hành văn chuẩn Socratic, chống hành văn kiểu AI và tạo Hook tâm lý nằm trong thư mục [skills/](file:///Users/winston/Desktop/github-trending-nontech/skills/).

---

## ⚡ Lệnh kích hoạt nhanh

Bạn có thể yêu cầu Agent thực hiện các nhiệm vụ bằng cách chat trực tiếp:
*   *"Biên soạn bản tin ngày hôm nay"* (Lưu vào `reports/YYYY_MM/daily_YYYY_MM_DD.md`)
*   *"Biên soạn bản tin tuần này"* (Lưu vào `reports/YYYY_MM/weekly_YYYY_Www.md`)
*   *"Biên soạn bản tin tháng này"* (Lưu vào `reports/YYYY_MM/monthly_YYYY_MM.md`)
