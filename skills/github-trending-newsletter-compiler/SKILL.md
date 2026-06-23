---
name: github-trending-newsletter-compiler
description: "Algorithmic execution pipeline, tool calls, and document layout schemas for the Vietnamese GitHub Trending compiler."
triggers: "github trending, bản tin trending, reports/YYYY_MM/daily_*.md, reports/YYYY_MM/weekly_*.md, reports/YYYY_MM/monthly_*.md"
category: workflows-and-management
tags: [github, trending, newsletter, vietnamese, curation, trendshift, mcp]
---

# GitHub Trending Newsletter Compiler Pipeline (SKILL.md)

Tài liệu này đặc tả quy trình kỹ thuật, các công cụ gọi (tools) và định dạng xuất bản (schema) của tệp báo cáo bản tin xu hướng công nghệ.

---

## 🔗 Các Skill bổ trợ liên kết

Quy trình này sẽ gọi nạp và kế thừa các chỉ thị hành văn từ các skill phụ trợ nằm trong cùng thư mục `skills/`:
*   `efficient-web-research` (Trích xuất thông tin README)
*   `explain-like-socrates` (Ẩn dụ Socratic)
*   `copywriting-psychologist` (Viết Hook tâm lý)
*   `beautiful-prose` & `avoid-ai-writing` (Văn phong tiếng Việt chuẩn)

---

## 🛠️ Quy trình thực thi (Execution Pipeline)

### Pha 1: Lấy danh sách xu hướng hợp nhất (Merged Data Acquisition)
1.  **Gọi Tool:** Gọi `github-trending-mcp:get_trending` với các tham số:
    *   `period`: `"daily"`, `"weekly"`, hoặc `"monthly"` dựa trên yêu cầu người dùng.
    *   `source`: `"both"` (mặc định để lấy kết quả gộp trùng).
    *   `language`: (Tùy chọn) Lọc theo ngôn ngữ lập trình.
    *   `date`: (Tùy chọn) Mã tuần/tháng đối với các báo cáo lịch sử.
2.  **Xác định quy mô danh sách:**
    *   **Daily (Hàng ngày):** Lấy top 15 repositories đầu tiên.
    *   **Weekly (Hàng tuần):** Lấy top 18 repositories đầu tiên.
    *   **Monthly (Hàng tháng):** Lấy top 20 repositories đầu tiên.

### Pha 2: Trích xuất thông tin chi tiết (Metadata Extraction)
Đối với mỗi repository trong danh sách đã chọn:
1.  **Gọi Tool:** Gọi `github-trending-mcp:get_repo_details` với tham số `repoPathOrId` (truyền vào `owner/name` của dự án hoặc ID số từ Trendshift).
2.  **Đọc thông tin:** Trích xuất các trường dữ liệu:
    *   Đường dẫn và link GitHub (`githubUrl`).
    *   Ngôn ngữ lập trình chính (`language`).
    *   Chỉ số thảo luận (`mentions` từ Hacker News, Reddit, X nếu có).
    *   Tóm tắt README (`readme` hoặc mô tả chính).

### Pha 3: Soạn thảo nội dung (Curation & Translation)
Lập luận dịch thuật dựa trên cấu trúc các cột:
*   **Ứng dụng thực tế (Hook):** Áp dụng công thức `[Nỗi đau/Vấn đề người dùng] + nhưng/mà + [Trở ngại/Ngần ngại]`. Bôi đậm các cụm từ quan trọng.
*   **Điểm độc đáo (Socratic):** Chuyển đổi các cấu trúc hạ tầng kỹ thuật (như Docker, DB, Memory, thread, API...) thành các phép ẩn dụ thực tế.
*   **Tính năng nổi bật (Features):** Viết từ 2-3 gạch đầu dòng dạng `•` (mỗi dòng dưới 10 từ). Không thêm emojis.

### Pha 4: Xuất bản và định dạng tệp tin (Document Schema)
*   **Tên tệp tin & Đường dẫn lưu:**
    *   Báo cáo ngày: `reports/YYYY_MM/daily_YYYY_MM_DD.md` (Ví dụ: `reports/2026_06/daily_2026_06_23.md`)
    *   Báo cáo tuần: `reports/YYYY_MM/weekly_YYYY_Www.md` (Ví dụ: `reports/2026_06/weekly_2026_W25.md`)
    *   Báo cáo tháng: `reports/YYYY_MM/monthly_YYYY_MM.md` (Ví dụ: `reports/2026_06/monthly_2026_06.md`)
*   **Tiêu đề báo cáo:** `# Bản tin GitHub Trending [ngày DD/MM/YYYY | Tuần WW/YYYY | Tháng MM/YYYY]` đi kèm dòng chữ nhỏ *Thời gian cập nhật: HH:MM, ngày DD/MM/YYYY*.
*   **Cấu trúc bảng HTML (Exact widths: 5% \| 15% \| 10% \| 20% \| 30% \| 20%):**

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

---

## 🛡️ Kiểm tra trước khi lưu (Pre-Save Verification)

Trước khi ghi tệp tin Markdown báo cáo, hãy kiểm tra danh sách sau:
1.  Độ rộng các cột trong thẻ `<th>` phải tương ứng chính xác `5%`, `15%`, `10%`, `20%`, `30%`, `20%` (tổng cộng bằng đúng 100%).
2.  Tất cả các thẻ HTML mở trong bảng phải có thẻ đóng tương ứng để tránh làm vỡ giao diện Markdown.
3.  Cột tính năng không được chứa bất kỳ emoji nào ngoài dấu chấm tròn mặc định `•`.
