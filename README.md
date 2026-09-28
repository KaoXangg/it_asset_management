# 🖥️ IT Asset Management System

Hệ thống quản lý tài sản IT cho doanh nghiệp vừa và nhỏ: theo dõi tài sản, phân bổ cho nhân viên, bảo trì, thống kê trên dashboard, xuất báo cáo Excel/PDF, quét mã QR và chatbot AI hỗ trợ người dùng.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-CC2927?logo=microsoftsqlserver&logoColor=white)

## Mục lục

1. [Tính năng](#tính-năng)
2. [Phân quyền](#phân-quyền)
3. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
4. [Kiến trúc](#kiến-trúc)
5. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
6. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
7. [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
8. [Biến môi trường](#biến-môi-trường)
9. [Cơ sở dữ liệu](#cơ-sở-dữ-liệu)
10. [Tài khoản demo](#tài-khoản-demo)
11. [Xác thực và bảo mật](#xác-thực-và-bảo-mật)
12. [API](#api)
13. [Trang giao diện](#trang-giao-diện)
14. [Kiểm thử](#kiểm-thử)
15. [Docker](#docker)
16. [Xử lý sự cố](#xử-lý-sự-cố)

## Tính năng

- **Quản lý tài sản**: thêm, sửa, xóa, xem chi tiết (mã tài sản, tên, loại, thương hiệu, model, serial, ngày mua, hạn bảo hành, giá mua, giá trị hiện tại, vị trí, ghi chú); tự sinh **mã QR**, có thể tạo lại QR; **tải ảnh** cho từng tài sản (JPEG/PNG/WEBP/GIF, tối đa 5MB).
- **Quét QR**: trang quét bằng camera (hoặc nhập mã thủ công) để tra cứu nhanh tài sản theo mã.
- **Tìm kiếm, lọc, phân trang** theo trạng thái (`available`, `in_use`, `maintenance`, `broken`, `disposed`), loại, danh mục.
- **Phân bổ tài sản**: cấp cho nhân viên, ghi nhận ngày trả, tự cập nhật trạng thái tài sản.
- **Quản lý bảo trì**: các loại `repair`, `inspection`, `upgrade`, `cleaning`, `other`; theo dõi chi phí, người thực hiện, trạng thái.
- **Quản lý người dùng** (Admin): tạo, sửa, khóa/mở khóa, xóa tài khoản, phân quyền.
- **Dashboard và báo cáo**: thẻ thống kê, biểu đồ Chart.js, danh sách tài sản cần bảo trì, chi phí bảo trì; xuất **Excel** (tài sản, phân bổ, bảo trì) và **PDF** (dashboard).
- **Activity logs**: ghi nhận đăng nhập, thao tác trên tài sản, phân bổ, bảo trì, người dùng.
- **Nhắc nhở qua email**: mỗi ngày lúc 08:00, gửi email tổng hợp tài sản sắp hết bảo hành (trong 7 ngày) và quá hạn bảo trì (> 180 ngày).
- **Chatbot AI** (Groq): hướng dẫn sử dụng hệ thống, có giới hạn tần suất.
- **Giao diện**: responsive, chế độ sáng/tối, skeleton loading, thông báo toast.

## Phân quyền

Ba vai trò: `admin`, `it_staff`, `regular_user`.

| Chức năng | Admin | IT Staff | Regular User |
|---|:---:|:---:|:---:|
| Xem danh sách, chi tiết tài sản / phân bổ / bảo trì | ✅ | ✅ | ✅ |
| Xem dashboard | ✅ | ✅ | ✅ |
| Thêm, sửa tài sản; tải ảnh; tạo lại QR | ✅ | ✅ | ❌ |
| Xóa tài sản | ✅ | ❌ | ❌ |
| Tạo phân bổ, trả tài sản | ✅ | ✅ | ❌ |
| Tạo, cập nhật bảo trì | ✅ | ✅ | ❌ |
| Báo cáo, xuất Excel/PDF, activity logs | ✅ | ✅ | ❌ |
| Xem danh sách người dùng | ✅ | ✅ | ❌ |
| Tạo, sửa, xóa người dùng | ✅ | ❌ | ❌ |
| Gửi thử email nhắc nhở | ✅ | ❌ | ❌ |
| Chatbot | ✅ | ✅ | ✅ |

## Công nghệ sử dụng

| Lớp | Công nghệ |
|---|---|
| Frontend | Next.js 14 (Pages Router), React 18, Axios, Chart.js + react-chartjs-2, react-query, react-hook-form, react-hot-toast, html5-qrcode, date-fns, react-icons |
| Backend | Node.js, Express 4, `express-validator`, `multer`, `qrcode`, `exceljs`, `pdfkit`, `node-cron`, `nodemailer`, `cookie-parser`, `cors` |
| Xác thực | JWT (access + refresh token), `bcryptjs` |
| Cơ sở dữ liệu | Microsoft SQL Server (driver `mssql`) |
| AI | Groq API (model `openai/gpt-oss-20b`) |
| Kiểm thử | Jest, Supertest |

## Kiến trúc

```
┌──────────────────┐   REST/JSON + Bearer JWT   ┌─────────────────────┐   T-SQL   ┌────────────┐
│ Next.js / React  │ ─────────────────────────► │ Express API         │ ────────► │ SQL Server │
│ (port 3000)      │ ◄───────────────────────── │ (port 5000)         │ ◄──────── │            │
└──────────────────┘   refresh cookie (httpOnly) └─────────────────────┘           └────────────┘
                                                     │        │
                                                     │        └─► SMTP (email nhắc nhở, cron 08:00)
                                                     └─► Groq API (chatbot)
```

Backend theo mô hình `routes → middleware (auth, validators, rate limit) → controllers → database`.

## Cấu trúc thư mục

```
.
├── backend/
│   ├── app.js                  # Khởi tạo Express app (dùng chung cho server và test)
│   ├── server.js               # Entry point, đăng ký cron job
│   ├── config/database.js      # Kết nối SQL Server (hỗ trợ named instance)
│   ├── controllers/            # auth, asset, assignment, maintenance, user, report, chat
│   ├── routes/                 # auth, assets, assignments, maintenance, users, reports, chat
│   ├── middleware/
│   │   ├── auth.js             # authenticateToken, authorizeRoles
│   │   ├── rateLimit.js        # Giới hạn request theo IP
│   │   ├── chatRateLimit.js    # Giới hạn riêng cho chatbot
│   │   ├── upload.js           # Multer upload ảnh tài sản
│   │   ├── errorHandler.js
│   │   └── validators/         # Luật validate cho auth, asset, assignment, maintenance, user
│   ├── jobs/notifyJob.js       # Cron gửi email nhắc nhở
│   ├── utils/                  # ApiError, catchAsync, cache, mailer
│   ├── database/
│   │   ├── mssql_schema.sql    # Schema + dữ liệu mẫu (SQL Server)
│   │   ├── full_database.sql   # Bản MySQL cũ, chỉ để tham khảo
│   │   └── migrations/         # Migration cho DB đã tồn tại
│   ├── tests/                  # Jest + Supertest (DB được mock)
│   ├── uploads/assets/         # Ảnh tài sản đã tải lên
│   ├── .env.example
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── components/         # Layout, ChatBot, Pagination, Skeleton, EmptyState, ThemeToggle
    │   ├── context/            # AuthContext
    │   ├── lib/                # api.js (axios + auto refresh token), labels, utils, useDebouncedValue
    │   ├── pages/              # login, dashboard, assets, assignments, maintenance, reports, users
    │   └── styles/globals.css
    ├── next.config.js
    ├── .env.local.example
    └── Dockerfile
```

## Yêu cầu hệ thống

- Node.js >= 18 (Dockerfile dùng Node 20)
- Microsoft SQL Server và SSMS, đã bật **SQL Server Authentication (Mixed Mode)**
- Groq API key miễn phí tại https://console.groq.com/keys (chỉ cần khi dùng chatbot)
- Tài khoản SMTP (tùy chọn, chỉ cần khi dùng email nhắc nhở)

## Cài đặt và chạy dự án

### 1. Clone

```bash
git clone https://github.com/KaoXangg/it_asset_management.git
cd it_asset_management
```

### 2. Tạo database

**Bật Mixed Mode**: trong SSMS, chuột phải server → *Properties* → *Security* → chọn *SQL Server and Windows Authentication mode*, restart SQL Server service. Sau đó vào *Security → Logins → sa → Properties*, đặt mật khẩu và chuyển *Status → Login* sang *Enabled*.

**Import schema**: trong SSMS chọn *File → Open → File...* → `backend/database/mssql_schema.sql` → *Execute (F5)*.

Script tạo database `it_asset_management`, các bảng và dữ liệu mẫu.

> Nếu DB đã tồn tại từ trước, chạy thêm `backend/database/migrations/001_add_asset_image_and_active.sql` (thêm cột `assets.image_url` và `users.is_active`). Không cần nếu tạo mới từ `mssql_schema.sql`.

### 3. Chạy Backend

```bash
cd backend
npm install
cp .env.example .env      # rồi sửa giá trị (xem mục Biến môi trường)
npm run dev               # nodemon; dùng "npm start" cho production
```

API chạy tại `http://localhost:5000`, kiểm tra tại `http://localhost:5000/api/health`.

### 4. Chạy Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Ứng dụng chạy tại `http://localhost:3000`.

### Scripts

| Thư mục | Lệnh | Mô tả |
|---|---|---|
| `backend` | `npm run dev` | Chạy với nodemon |
| `backend` | `npm start` | Chạy production |
| `backend` | `npm test` | Chạy Jest |
| `frontend` | `npm run dev` | Chạy dev server |
| `frontend` | `npm run build` / `npm start` | Build và chạy production |
| `frontend` | `npm run lint` | ESLint |

## Biến môi trường

### `backend/.env`

```env
PORT=5000
NODE_ENV=development

# Named instance: DB_HOST=localhost\SQLEXPRESS (khi đó bỏ DB_PORT)
DB_HOST=localhost
DB_PORT=1433
DB_NAME=it_asset_management
DB_USER=sa
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here
# Nên khác JWT_SECRET. Bỏ trống thì dùng chung JWT_SECRET.
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Domain frontend được phép gọi API (nhiều domain thì cách nhau bằng dấu phẩy)
FRONTEND_URL=http://localhost:3000

GROQ_API_KEY=your_groq_api_key_here

# Email nhắc nhở, để trống nếu chưa dùng
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="IT Asset Management <no-reply@example.com>"
NOTIFY_EMAILS=
```

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> Không commit `.env` và `.env.local`. Dùng secret ngẫu nhiên, dài (tối thiểu 32 ký tự) cho `JWT_SECRET` và `REFRESH_TOKEN_SECRET`.

## Cơ sở dữ liệu

| Bảng | Mô tả |
|---|---|
| `users` | Người dùng: mật khẩu băm bcrypt, `role`, `is_active` |
| `asset_categories` | Danh mục tài sản |
| `assets` | Tài sản: mã, loại, trạng thái, tình trạng, giá trị, QR, `image_url` |
| `asset_assignments` | Lịch sử phân bổ (`active`, `returned`, `overdue`) |
| `maintenance_records` | Lịch sử bảo trì (`pending`, `in_progress`, `completed`, `cancelled`) |
| `activity_logs` | Nhật ký hoạt động |

Giá trị ràng buộc:

- `users.role`: `admin`, `it_staff`, `regular_user`
- `assets.type`: `laptop`, `desktop`, `monitor`, `printer`, `phone`, `tablet`, `other`
- `assets.condition_status`: `new`, `good`, `fair`, `poor`

Quan hệ chính: `asset_categories` 1–N `assets`; `assets` 1–N `asset_assignments` và `maintenance_records`; `users` 1–N `asset_assignments` và `activity_logs`.

## Tài khoản demo

Dữ liệu mẫu tạo sẵn 3 tài khoản:

| Vai trò | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| IT Staff | `itstaff` | `staff123` |
| Regular User | `user` | `user123` |

> ⚠️ Chỉ dùng cho môi trường phát triển. **Đổi mật khẩu hoặc xóa các tài khoản này trước khi triển khai thật.**

## Xác thực và bảo mật

- **Access token** JWT sống 30 phút, gửi qua header `Authorization: Bearer <token>`.
- **Refresh token** sống 7 ngày, lưu trong cookie `httpOnly` (`sameSite=lax`, `secure` khi `NODE_ENV=production`, giới hạn `path=/api/auth`) và được **xoay vòng** mỗi lần refresh. Frontend tự gọi `/auth/refresh` khi gặp 401 rồi gửi lại request.
- Mật khẩu băm bằng `bcryptjs`; tài khoản bị khóa (`is_active = 0`) không đăng nhập hoặc refresh được.
- `POST /auth/register` chỉ dành cho Admin đã đăng nhập.
- Rate limit theo IP: đăng nhập tối đa 10 lần/phút, chatbot tối đa 15 tin/phút. Bộ đếm lưu trong bộ nhớ, nếu chạy nhiều instance nên chuyển sang Redis.
- CORS chỉ cho phép các origin trong `FRONTEND_URL`, có `credentials`.
- Dữ liệu vào được kiểm tra bằng `express-validator`; upload ảnh giới hạn loại file và 5MB.
- `GROQ_API_KEY` chỉ nằm ở backend, không đưa xuống trình duyệt.

## API

Base URL: `http://localhost:5000/api`. Mọi endpoint cần access token, trừ các endpoint ghi chú Public.

### Auth

| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| POST | `/auth/login` | Đăng nhập, trả access token và set cookie refresh | Public (rate limit) |
| POST | `/auth/refresh` | Cấp access token mới từ cookie refresh | Public (cần cookie) |
| POST | `/auth/logout` | Xóa cookie refresh | Public |
| POST | `/auth/register` | Tạo tài khoản | Admin |
| GET | `/auth/profile` | Thông tin người dùng hiện tại | Đã đăng nhập |

### Assets

| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/assets` | Danh sách, tìm kiếm, lọc, phân trang | Đã đăng nhập |
| GET | `/assets/stats` | Thống kê tài sản | Đã đăng nhập |
| GET | `/assets/code/:code` | Tra cứu theo mã (dùng cho quét QR) | Đã đăng nhập |
| GET | `/assets/:id` | Chi tiết tài sản | Đã đăng nhập |
| POST | `/assets` | Tạo tài sản, tự sinh QR | Admin, IT Staff |
| PUT | `/assets/:id` | Cập nhật | Admin, IT Staff |
| POST | `/assets/:id/qrcode` | Tạo lại mã QR | Admin, IT Staff |
| POST | `/assets/:id/image` | Tải ảnh (multipart, field `image`) | Admin, IT Staff |
| DELETE | `/assets/:id` | Xóa | Admin |

### Assignments

| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/assignments` | Danh sách phân bổ | Đã đăng nhập |
| GET | `/assignments/my-assignments` | Phân bổ của tôi | Đã đăng nhập |
| POST | `/assignments` | Tạo phân bổ | Admin, IT Staff |
| PUT | `/assignments/:id/return` | Trả tài sản | Admin, IT Staff |

### Maintenance

| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/maintenance` | Danh sách bảo trì | Đã đăng nhập |
| GET | `/maintenance/:id` | Chi tiết | Đã đăng nhập |
| POST | `/maintenance` | Tạo bản ghi | Admin, IT Staff |
| PUT | `/maintenance/:id` | Cập nhật | Admin, IT Staff |

### Users

| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/users` | Danh sách người dùng | Admin, IT Staff |
| GET | `/users/:id` | Chi tiết | Admin, IT Staff |
| PUT | `/users/:id` | Cập nhật (vai trò, khóa/mở khóa) | Admin |
| DELETE | `/users/:id` | Xóa | Admin |

### Reports

| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/reports/dashboard` | Số liệu dashboard | Đã đăng nhập |
| GET | `/reports/activity-logs` | Nhật ký hoạt động | Admin, IT Staff |
| GET | `/reports/due-maintenance` | Tài sản cần bảo trì | Admin, IT Staff |
| GET | `/reports/maintenance-cost` | Chi phí bảo trì | Admin, IT Staff |
| GET | `/reports/export/assets` | Xuất Excel tài sản | Admin, IT Staff |
| GET | `/reports/export/assignments` | Xuất Excel phân bổ | Admin, IT Staff |
| GET | `/reports/export/maintenance` | Xuất Excel bảo trì | Admin, IT Staff |
| GET | `/reports/export/dashboard-pdf` | Xuất PDF dashboard | Admin, IT Staff |
| POST | `/reports/notify-test` | Chạy thử job nhắc nhở | Admin |

### Khác

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/chat` | Chatbot (body: `message`, `history`), tối đa 15 tin/phút/IP |
| GET | `/health` | Kiểm tra API |
| GET | `/uploads/assets/<file>` | Ảnh tài sản (static) |

## Trang giao diện

| Đường dẫn | Mô tả |
|---|---|
| `/login` | Đăng nhập |
| `/` | Dashboard |
| `/assets` | Danh sách tài sản |
| `/assets/create` | Thêm tài sản |
| `/assets/[id]` | Chi tiết tài sản |
| `/assets/[id]/edit` | Sửa tài sản |
| `/assets/scan` | Quét mã QR |
| `/assignments` | Danh sách phân bổ |
| `/assignments/create` | Tạo phân bổ |
| `/maintenance` | Danh sách bảo trì |
| `/maintenance/create` | Tạo bản ghi bảo trì |
| `/maintenance/[id]/edit` | Sửa bản ghi bảo trì |
| `/reports` | Báo cáo và thống kê |
| `/users` | Quản lý người dùng |

## Kiểm thử

```bash
cd backend
npm test
```

Jest chạy với `--runInBand`; test dùng Supertest và **mock** lớp database (`tests/__mocks__/database.js`) nên không cần SQL Server. Hiện có test cho luồng đăng nhập và tài sản.

## Docker

Mỗi service có Dockerfile riêng (Node 20 Alpine).

```bash
# Backend (cổng 5000)
docker build -t itam-backend ./backend
docker run -d -p 5000:5000 --env-file backend/.env -v itam_uploads:/app/uploads itam-backend

# Frontend (cổng 3000). NEXT_PUBLIC_API_URL được nhúng lúc build
docker build -t itam-frontend ./frontend
docker run -d -p 3000:3000 itam-frontend
```

Lưu ý:

- SQL Server chạy ngoài container, nên `DB_HOST` trong `.env` cần trỏ tới máy host (ví dụ `host.docker.internal`), không dùng `localhost`.
- `frontend/Dockerfile` copy thư mục `public`; nếu dự án chưa có thư mục này, hãy tạo `frontend/public/` (có thể để trống với file `.gitkeep`) để build không lỗi.

## Xử lý sự cố

| Lỗi | Cách xử lý |
|---|---|
| Backend thoát ngay với `Kết nối SQL Server thất bại` | Kiểm tra SQL Server đã chạy, đã bật Mixed Mode, `sa` ở trạng thái Enabled, đúng `DB_USER`/`DB_PASSWORD`, bật TCP/IP (port 1433). Named instance dùng `DB_HOST=localhost\SQLEXPRESS` và bỏ `DB_PORT`. |
| `Not allowed by CORS` | Thêm đúng origin của frontend vào `FRONTEND_URL`. |
| Bị đăng xuất liên tục | Kiểm tra `JWT_SECRET`/`REFRESH_TOKEN_SECRET` không đổi giữa các lần chạy; xóa `token`, `user` trong Local Storage rồi đăng nhập lại. |
| Chatbot báo chưa cấu hình API key | Điền `GROQ_API_KEY` trong `backend/.env` rồi khởi động lại backend. |
| Không nhận được email nhắc nhở | Điền đủ `SMTP_*` và `NOTIFY_EMAILS`; dùng `POST /api/reports/notify-test` (Admin) để chạy thử. |
| Port 5000 / 3000 đã được dùng | Đổi `PORT` trong `backend/.env` (và `NEXT_PUBLIC_API_URL` cho khớp), hoặc chạy frontend với `npm run dev -- -p 3001` (khi đó thêm `http://localhost:3001` vào `FRONTEND_URL`). |
| `Cannot find module` | Chạy lại `npm install` trong thư mục tương ứng. |