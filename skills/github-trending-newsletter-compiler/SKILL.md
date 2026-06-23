---
name: github-trending-compiler-pipeline
description: "Quy trình kỹ thuật, công cụ gọi MCP và cấu trúc định dạng bảng HTML cho việc xuất bản bản tin xu hướng công nghệ."
risk: safe
source: original
date_added: "2026-06-23"
---

# Quy trình Biên dịch Bản tin GitHub Trending (SKILL.md)

Tài liệu này đóng vai trò là **Bản vẽ kỹ thuật & Layout Engine** chỉ định quy trình xử lý dữ liệu tự động, các tham số gọi công cụ MCP, quy chuẩn đặt tên tệp tin và cấu trúc bảng HTML xuất bản của Bản tin Xu hướng Công nghệ.

Kỹ năng này được lưu trữ tại: `skills/github-trending-newsletter-compiler/SKILL.md` và hỗ trợ Agent thực hiện công việc chuyển đổi dữ liệu thô thành tài liệu báo cáo có cấu trúc.

---

## 🛠️ Quy trình Thực thi Kỹ thuật (Execution Pipeline)

### Pha 1: Lấy danh sách xu hướng hợp nhất (Merged Data Acquisition)
1.  **Gọi Tool:** Gọi `github-trending-mcp:get_trending` với các tham số tương ứng với chu kỳ yêu cầu:
    *   `period`: `"daily"` (hàng ngày), `"weekly"` (hàng tuần), hoặc `"monthly"` (hàng tháng).
    *   `source`: `"both"` (thu thập gộp dữ liệu trùng từ cả GitHub và Trendshift).
    *   `language`: (Tùy chọn) lọc theo ngôn ngữ lập trình cụ thể nếu người dùng yêu cầu.
2.  **Giới hạn số lượng dự án:**
    *   **Daily (Hàng ngày):** Chọn lọc top 15 dự án đầu tiên.
    *   **Weekly (Hàng tuần):** Chọn lọc top 18 dự án đầu tiên.
    *   **Monthly (Hàng tháng):** Chọn lọc top 20 dự án đầu tiên.

### Pha 2: Trích xuất siêu dữ liệu chi tiết (Metadata Extraction)
Với mỗi dự án trong danh sách được chọn, thực hiện:
1.  **Gọi Tool:** Gọi `github-trending-mcp:get_repo_details` với tham số `repoPathOrId` (truyền vào `owner/name` của dự án từ GitHub hoặc ID Trendshift).
2.  **Đọc và lọc dữ liệu:** Trích xuất các trường dữ liệu cần thiết:
    *   Đường dẫn gốc của dự án (`githubUrl`).
    *   Ngôn ngữ lập trình chính (`language`).
    *   Chỉ số thảo luận mạng xã hội (`mentions` từ Hacker News, Reddit, X).
    *   Nội dung tóm tắt README của dự án.

### Pha 3: Ánh xạ cấu trúc dữ liệu bảng (Data Schema Mapping)
Sắp xếp dữ liệu đã được Nhạc trưởng biên soạn thông qua các kỹ năng viết lách để đưa vào các cột tương ứng trong bảng:
*   **#**: Số thứ tự xếp hạng (Index).
*   **Dự án**: Tên dự án (in đậm, kèm liên kết trỏ tới GitHub) và ngôn ngữ lập trình (in chữ nhỏ).
*   **Nguồn xu hướng**: Ghi rõ nguồn phát hiện (`GitHub`, `Trendshift` hoặc `Cả hai`) kèm theo số lượt thảo luận mạng xã hội nếu có.
*   **Ứng Dụng Thực Tế**: Nội dung lời dẫn nhập (Hook) do kỹ năng `copywriting-psychologist` biên soạn.
*   **Điểm Độc Đáo (Socratic)**: Phép ẩn dụ và giải thích triết lý công nghệ do kỹ năng `explain-like-socrates` biên soạn.
*   **Tính Năng Nổi Bật**: Danh sách 2-3 tính năng cốt lõi (sử dụng chấm tròn đen `•`, dòng dưới 10 từ).

### Pha 4: Quy chuẩn Đặt tên File & Đường dẫn Xuất bản (Output Naming)
*   **Đường dẫn lưu tệp tin:**
    *   Báo cáo ngày: `reports/YYYY_MM/daily_YYYY_MM_DD.md` (Ví dụ: `reports/2026_06/daily_2026_06_23.md`)
    *   Báo cáo tuần: `reports/YYYY_MM/weekly_YYYY_Www.md` (Ví dụ: `reports/2026_06/weekly_2026_W25.md`)
    *   Báo cáo tháng: `reports/YYYY_MM/monthly_YYYY_MM.md` (Ví dụ: `reports/2026_06/monthly_2026_06.md`)
*   **Quy chuẩn tiêu đề tệp tin:**
    Sử dụng thẻ H1 dạng: `# Bản tin GitHub Trending [ngày DD/MM/YYYY | Tuần WW/YYYY | Tháng MM/YYYY]`.
    Kèm dòng chữ nhỏ ngay bên dưới: *Thời gian cập nhật: HH:MM, ngày DD/MM/YYYY*.

---

## 📐 Định dạng bảng HTML xuất bản (Layout Schema)

Bảng xuất bản bắt buộc phải tuân thủ cấu trúc HTML chuẩn dưới đây để đảm bảo hiển thị đồng đều trên các thiết bị. Độ rộng các cột được định nghĩa chính xác theo tỷ lệ: **5% | 15% | 10% | 20% | 30% | 20%** (tổng bằng đúng 100%).

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
      <td align="center">[Xếp_Hạng]</td>
      <td><strong><a href="[GitHub_URL]">[Tên_Repo]</a></strong><br><small>[Ngôn_Ngữ]</small></td>
      <td>[Nhãn_Nguồn]</td>
      <td>[Nội_Dung_Hook]</td>
      <td>[Phép_Ẩn_Dụ_Socratic]</td>
      <td>• [Tính năng 1]<br>• [Tính năng 2]</td>
    </tr>
  </tbody>
</table>
```

---

## 🛡️ Kiểm soát tính toàn vẹn (Structural Verification)

Trước khi lưu tệp tin Markdown, bạn phải kiểm tra:
1.  Đo đạc và đảm bảo độ rộng (`width`) trong các thẻ `<th>` khớp chính xác với tỷ lệ đã đặc tả (`5%`, `15%`, `10%`, `20%`, `30%`, `20%`).
2.  Tất cả các thẻ HTML mở trong bảng (như `<strong>`, `<a>`, `<small>`, `<br>`) phải có thẻ đóng tương ứng để tránh làm vỡ giao diện hiển thị Markdown của IDE hoặc trình duyệt.
