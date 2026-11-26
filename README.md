# Lớp Học Kết Nối (Connected Classroom) — Demo 100% Dữ Liệu Giả Lập

Website demo nền tảng kết nối giữa **Ban Giám hiệu (Admin)**, **Giáo viên chủ nhiệm (GVCN)**, **Phụ huynh** và **Học sinh** với dữ liệu giả lập đầy đủ cho **5 lớp học (7A1, 7A3, 10A2, 11A1, 11A2)** và **150 học sinh (30 học sinh/lớp)** lưu trữ trên **LocalStorage**.

> **Lưu ý:** Toàn bộ xác thực và dữ liệu trong ứng dụng này là **mô phỏng phục vụ trình diễn**, không kết nối cơ sở dữ liệu thật và không dùng cho môi trường bảo mật production.

---

## Tài khoản Demo (Mật khẩu chung: `123456`)

| Vai trò | Email | Phạm vi truy cập |
| :--- | :--- | :--- |
| **Admin** | `admin@hpu2.it` | Toàn trường (5 lớp, 150 học sinh), thống kê, Reset Demo |
| **GVCN 7A1** | `teacher7a1@hpu2.it` | Chỉ lớp 7A1 (30 học sinh) |
| **GVCN 7A3** | `teacher7a3@dhpu2.it` | Chỉ lớp 7A3 (30 học sinh) |
| **GVCN 10A2** | `teacher10a2@hpu2.it` | Chỉ lớp 10A2 (30 học sinh) |
| **GVCN 11A1** | `teacher11a1@hpu2.it` | Chỉ lớp 11A1 (30 học sinh) |
| **GVCN 11A2** | `teacher11a2@hpu2.it` | Chỉ lớp 11A2 (30 học sinh) |
| **Phụ huynh 01** | `parent01@hpu2.it` | Phụ huynh em Nguyễn Minh An (7A1 - `HS7A101`) |
| **Phụ huynh 02** | `parent02@hpu2.it` | Phụ huynh em Trần Bảo Ngọc (10A2 - `HS10A201`) |
| **Phụ huynh 03** | `parent03@hpu2.it` | Phụ huynh em Lê Hoàng Phúc (11A1 - `HS11A101`) |
| **Học sinh 01** | `student01@hpu2.it` | Hồ sơ cá nhân em Nguyễn Minh An (7A1) |
| **Học sinh 02** | `student02@hpu2.it` | Hồ sơ cá nhân em Trần Bảo Ngọc (10A2) |
| **Học sinh 03** | `student03@hpu2.it` | Hồ sơ cá nhân em Lê Hoàng Phúc (11A1) |

---

## Hướng dẫn chạy Local

1. Cài đặt thư viện:
   ```bash
   npm install
   ```
2. (Tùy chọn) Nếu muốn dùng Gemini AI thật qua server proxy, tạo file `.env` từ `.env.example` và điền `GEMINI_API_KEY`. Nếu không cấu hình, hệ thống tự động dùng **AI mô phỏng (Demo Mode)** và hiển thị thông báo rõ ràng.
3. Khởi chạy môi trường phát triển:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt tại `http://localhost:3000`.

---

## Hướng dẫn Deploy lên Vercel

1. Đẩy source code lên GitHub/GitLab/Bitbucket.
2. Trên Vercel, chọn **Add New Project** và import repository.
3. Cấu hình build mặc định (Vercel tự nhận Vite):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. File `vercel.json` đã được cấu hình sẵn SPA fallback (`/* -> /index.html`) để điều hướng React Router hoạt động mượt mà khi reload trang.
5. Do toàn bộ dữ liệu demo lưu tại `LocalStorage` trình duyệt và có `Mock AI Service` tích hợp sẵn, bản deploy tĩnh trên Vercel hoạt động đầy đủ mọi chức năng ngay lập tức.
