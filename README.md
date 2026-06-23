# GitHub Trending & Trendshift Vietnamese Newsletter Compiler

Hệ thống tự động hóa việc thu thập, hợp nhất dữ liệu xu hướng công nghệ từ **GitHub Trending** và **Trendshift.io**, sau đó sử dụng các mô hình ngôn ngữ lớn (LLM) để biên dịch thành bản tin công nghệ tiếng Việt phi kỹ thuật theo phong cách Socratic và tâm lý học copywriting.

---

## 📂 Cấu trúc dự án

Dự án được cấu trúc tự chứa (self-contained) bao gồm cả công cụ thu thập dữ liệu (MCP) và các chỉ dẫn hành vi cho trí tuệ nhân tạo (Skills/Agent):

*   **`github-trending-mcp/`**: Server Model Context Protocol (MCP) chạy bằng Node.js. Chịu trách nhiệm cào dữ liệu song song từ hai nguồn, lọc trùng, gộp chỉ số thảo luận xã hội (Hacker News, Reddit, X) và phân giải README qua GitHub API.
*   **`github-trending-newsletter-compiler/`**: Skill cốt lõi (`SKILL.md`) định nghĩa quy trình 4 pha của Agent để xử lý thông tin và định dạng bảng báo cáo bản tin.
*   **`skills/`**: Thư mục chứa 5 skill bổ trợ làm nền tảng cho văn phong viết lách:
    *   `efficient-web-research`: Tối ưu hóa việc đọc hiểu file README của AI.
    *   `explain-like-socrates`: Chuyển đổi thuật ngữ công nghệ phức tạp thành các phép ẩn dụ trực quan.
    *   `copywriting-psychologist`: Viết câu tiêu đề (Hook) dựa trên nỗi đau thực tế của người dùng.
    *   `beautiful-prose` & `avoid-ai-writing`: Đảm bảo hành văn tự nhiên, loại bỏ các cụm từ sáo rỗng thường gặp của AI.
*   **`reports/`**: Nơi lưu trữ các bản tin đã được xuất bản (định dạng Markdown dạng bảng HTML) phân chia theo thư mục Tháng (ví dụ: `reports/2026_06/`).
*   **`agent.md`**: Tệp chỉ thị hành vi cấp cao dành cho trợ lý AI tại root của workspace.
*   **`.gitignore`**: Loại trừ các tệp rác hệ thống, cấu hình môi trường `.env` và thư mục `node_modules/`.

---

## 🛠️ Hướng dẫn cài đặt & Cấu hình

### 1. Cài đặt phụ thuộc cho MCP Server
Di chuyển vào thư mục MCP và cài đặt các thư viện Node.js:
```bash
cd github-trending-mcp
npm install
```

### 2. Đăng ký MCP Server với IDE (Antigravity IDE / Cursor)
Thêm cấu hình sau vào tệp tin `mcp_config.json` của IDE (nằm tại vị trí toàn cục hoặc thư mục ứng dụng cài đặt):

```json
{
  "mcpServers": {
    "github-trending-mcp": {
      "command": "node",
      "args": [
        "/Users/winston/Desktop/github-trending-nontech/github-trending-mcp/index.js"
      ],
      "env": {
        "GITHUB_TOKEN": "YOUR_GITHUB_TOKEN_OPTIONAL"
      }
    }
  }
}
```
*(Lưu ý: Biến môi trường `GITHUB_TOKEN` là tùy chọn để tăng giới hạn API rate limit của GitHub từ 60 lên 5000 request/giờ).*

### 3. Kiểm thử MCP cục bộ
Bạn có thể kiểm tra xem MCP server có hoạt động tốt và kết xuất dữ liệu chính xác hay không bằng cách chạy script kiểm thử:
```bash
cd github-trending-mcp
node test_merged_mcp.mjs
```

---

## ✍️ Cách sử dụng Skill để biên dịch bản tin

Để kích hoạt trợ lý AI thực hiện biên dịch bản tin, bạn chỉ cần mở khung chat trong workspace này và yêu cầu bằng tiếng Việt. 

**Ví dụ câu lệnh:**
*   *"Biên soạn giúp tôi bản tin GitHub Trending ngày hôm nay"*
*   *"Tạo bản tin xu hướng tuần này (tuần 26 năm 2026)"*
*   *"Tổng hợp bản tin xu hướng công nghệ tháng này"*

Agent sẽ tự động gọi tool `get_trending` từ `github-trending-mcp`, lấy danh sách dữ liệu hợp nhất, nghiên cứu README của các dự án hàng đầu thông qua `get_repo_details` và tiến hành viết bài chuẩn theo văn phong Socratic bản xứ.
