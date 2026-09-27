🖥️ IT Asset Management System

Hệ thống quản lý tài sản CNTT (máy tính, thiết bị văn phòng...) — theo dõi phân bổ tài sản cho nhân viên, lịch bảo trì định kỳ, tra cứu bằng QR code, xuất báo cáo Excel/PDF. Full-stack: Next.js (frontend), Node.js/Express (backend), SQL Server (database), xác thực bằng JWT.

📋 Mục lục

	•	Yêu cầu hệ thống
	•	Kiến trúc & công nghệ
	•	Tính năng chính
	•	Cấu trúc thư mục
	•	Cài đặt nhanh (tự động) - Windows
	•	Cài đặt thủ công từ A → Z
	•	Tài khoản demo
	•	Các lệnh hữu ích
	•	Chạy test
	•	Xử lý lỗi thường gặp
	•	Ghi chú quan trọng

🖥️ Yêu cầu hệ thống

Thành phần	Phiên bản khuyến nghị
Node.js	18 LTS trở lên
npm	đi kèm Node.js
SQL Server	2019+ (Express/Developer đều được)
SQL Server Management Studio (SSMS)	khuyến nghị để thao tác DB bằng giao diện
Hệ điều hành	Windows (có sẵn run-project.bat), macOS/Linux chạy được bằng cách làm thủ công

🏗️ Kiến trúc & công nghệ

Backend (/backend):

	•	Node.js + Express
	•	SQL Server (thư viện mssql)
	•	JWT (jsonwebtoken) — có tách riêng access token và refresh token (REFRESH_TOKEN_SECRET), refresh token quản lý qua cookie (cookie-parser)
	•	bcryptjs — mã hoá mật khẩu
	•	express-validator — validate dữ liệu đầu vào
	•	multer — upload file
	•	qrcode — sinh mã QR cho tài sản
	•	pdfkit — xuất báo cáo PDF
	•	exceljs — xuất báo cáo Excel
	•	node-cron — tác vụ định kỳ (nhắc bảo trì, cảnh báo hết bảo hành)
	•	nodemailer — gửi email nhắc nhở
	•	Tích hợp Groq API — tính năng AI (cần API key riêng, lấy free tại console.groq.com/keys)
	•	Test: jest + supertest

Frontend (/frontend):

	•	Next.js 14
	•	React 18
	•	Axios (gọi API)
	•	Chart.js + react-chartjs-2 (biểu đồ dashboard)
	•	React Query (quản lý cache dữ liệu server)
	•	React Hook Form (quản lý form)
	•	React Hot Toast (thông báo)
	•	React Icons
	•	html5-qrcode — quét mã QR bằng camera (kết hợp với qrcode bên backend để tạo vòng lặp tạo mã → quét mã)
	•	date-fns

Database: SQL Server, tên database it_asset_management. Trước đây project dùng MySQL, đã migrate hẳn sang SQL Server — schema MySQL cũ (full_database.sql) chỉ giữ lại để tham khảo, không dùng để chạy project hiện tại.

✨ Tính năng chính

Dựa trên dữ liệu mẫu và các thư viện tích hợp:

	•	Quản lý danh sách tài sản CNTT (thêm/sửa/xoá, tra cứu)
	•	Phân bổ tài sản cho nhân viên/phòng ban, theo dõi lịch sử phân bổ
	•	Lịch bảo trì định kỳ, tự động nhắc qua email khi đến hạn bảo trì/sắp hết bảo hành (node-cron + nodemailer)
	•	Sinh mã QR cho từng tài sản, quét mã bằng camera điện thoại để tra cứu nhanh
	•	Xuất báo cáo dạng Excel và PDF
	•	Dashboard trực quan bằng biểu đồ (Chart.js)
	•	Phân quyền theo vai trò: admin, itstaff, user
	•	Trợ lý AI tích hợp qua Groq API (tính năng cụ thể xem trong code backend, route liên quan đến AI)
Danh sách endpoint API chi tiết chưa được liệt kê ở đây vì cần đọc trực tiếp thư mục backend/routes — mở file đó để biết chính xác từng nhóm route.

📁 Cấu trúc thư mục

it_asset_management/
├── backend/
│   ├── database/
│   │   ├── mssql_schema.sql     # Schema + dữ liệu mẫu cho SQL Server — DÙNG FILE NÀY
│   │   └── full_database.sql    # Schema MySQL cũ — CHỈ để tham khảo, không dùng
│   ├── tests/                   # Test Jest + Supertest
│   ├── .env.example
│   ├── server.js                # Điểm khởi chạy Express
│   └── package.json
├── frontend/
│   ├── .env.example              # (nếu có — xem ghi chú bên dưới)
│   └── package.json
├── .github/workflows/            # CI
├── .gitignore
├── docker-compose.yml
├── IMPORT_DATABASE.txt           # Hướng dẫn import DB SQL Server chi tiết
├── REPORT_NEW.md
├── tài khoản.md                  # Tài khoản demo
├── run-project.bat                # Cài đặt + chạy nhanh trên Windows
└── package.json                   # Chạy đồng thời backend + frontend qua "concurrently"

⚡ Cài đặt nhanh (tự động) - Windows

	1.	Double-click run-project.bat ở thư mục gốc.
	2.	Script sẽ tự động:
	•	Kiểm tra Node.js đã cài chưa
	•	Cài npm install ở thư mục gốc, backend/, frontend/ (nếu node_modules chưa tồn tại)
	•	Chạy npm run dev ở gốc (khởi động đồng thời backend + frontend nhờ concurrently)
Script này không tự tạo file .env và không tự chạy SQL — 2 việc đó vẫn cần làm thủ công theo hướng dẫn bên dưới trước khi chạy run-project.bat, nếu không backend sẽ báo lỗi kết nối DB hoặc thiếu biến môi trường.

🔧 Cài đặt thủ công từ A → Z

1. Cài dependencies

cd it_asset_management
npm install
cd backend && npm install
cd ../frontend && npm install

2. Cài đặt SQL Server

	•	Cài SQL Server (Express/Developer) + SSMS.
	•	Bật Mixed Mode Authentication:
	1.	Mở SSMS → chuột phải vào server (gốc cây) → Properties → Security → chọn SQL Server and Windows Authentication mode.
	2.	Bấm OK → chuột phải server → Restart.
	•	Bật tài khoản sa:
	1.	Security → Logins → chuột phải sa → Properties.
	2.	Tab General: đặt password (ví dụ YourStrong@Passw0rd).
	3.	Tab Status: Login = Enabled.
	4.	Bấm OK.

3. Tạo database & import dữ liệu mẫu

	1.	Trong SSMS: File → Open → File... → chọn backend/database/mssql_schema.sql.
	2.	Nhấn Execute (F5).

Script này tự tạo database it_asset_management, toàn bộ bảng, và dữ liệu mẫu:

	•	8 tài sản mẫu
	•	5 bản ghi phân bổ
	•	6 bản ghi bảo trì
	•	3 tài khoản demo (xem phần Tài khoản demo)
⚠️ Không chạy full_database.sql — đó là schema MySQL cũ, không tương thích SQL Server.

4. Cấu hình biến môi trường

Backend — copy backend/.env.example thành backend/.env:

PORT=5000
NODE_ENV=development

# Tên server SQL Server. Nếu dùng named instance: DB_HOST=localhost\SQLEXPRESS (bỏ DB_PORT khi dùng named instance)
DB_HOST=localhost
DB_PORT=1433
DB_NAME=it_asset_management
DB_USER=sa
DB_PASSWORD=YourStrong@Passw0rd        # ⚠️ đổi đúng mật khẩu sa bạn vừa đặt ở bước 2

JWT_SECRET=doi-thanh-chuoi-ngau-nhien-du-manh        # ⚠️ không giữ giá trị mẫu
# Secret riêng cho refresh token (khuyến nghị khác JWT_SECRET). Nếu bỏ trống sẽ dùng chung JWT_SECRET.
REFRESH_TOKEN_SECRET=doi-thanh-chuoi-khac-voi-jwt-secret

# Domain(s) của frontend được phép gọi API (phân tách bằng dấu phẩy nếu nhiều domain)
FRONTEND_URL=http://localhost:3000

# Lấy free API key tại https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# Cấu hình email nhắc nhở (bảo trì định kỳ, sắp hết bảo hành...) — để trống nếu chưa dùng
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="IT Asset Management <no-reply@example.com>"
NOTIFY_EMAILS=

Tạo cả 2 secret bằng lệnh này (chạy 2 lần, mỗi lần copy ra 1 giá trị khác nhau cho JWT_SECRET và REFRESH_TOKEN_SECRET):

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

Frontend — thư mục frontend/ hiện chưa có sẵn .env.example. Trước khi chạy, mở code trong frontend/ (thường ở file cấu hình gọi API, ví dụ lib/api.js hoặc services/api.js) để xem chính xác biến môi trường frontend đang dùng để trỏ tới backend. Quy ước phổ biến nhất với Next.js là:

NEXT_PUBLIC_API_URL=http://localhost:5000

Tạo file frontend/.env.local với đúng tên biến tìm được trong code, trỏ về http://localhost:5000 (khớp PORT ở backend). Nếu gọi API không được, mở tab Network trên trình duyệt để xem frontend đang gọi sai địa chỉ nào.

5. Chạy dự án

Cách 1 — chạy cùng lúc từ thư mục gốc (khuyến nghị, dùng concurrently):

npm run dev

Cách 2 — chạy riêng từng phần (2 terminal):

# Terminal 1
cd backend
npm run dev      # nodemon, tự reload khi sửa code

# Terminal 2
cd frontend
npm run dev      # Next.js dev server

Truy cập ứng dụng:

	•	Backend API: http://localhost:5000
	•	Frontend: http://localhost:3000

👤 Tài khoản demo

Có sẵn ngay sau khi import mssql_schema.sql (theo tài khoản.md):

Vai trò	Tài khoản	Mật khẩu
Admin	admin	admin123
IT Staff	itstaff	staff123
User	user	user123

⚠️ Đây là tài khoản demo với mật khẩu rất yếu — chỉ dùng cho môi trường dev/test cục bộ, không đưa các tài khoản này vào bản deploy thật.

🛠️ Các lệnh hữu ích

Gốc project:

npm run dev          # chạy đồng thời backend + frontend (concurrently)

Backend (cd backend):

npm run dev      # nodemon, tự reload
npm start        # chạy production, không watch
npm test         # chạy test bằng Jest (--runInBand)

Frontend (cd frontend):

npm run dev      # Next.js dev server
npm run build    # build production
npm start        # chạy bản đã build
npm run lint     # kiểm tra ESLint

🧪 Chạy test

Backend có sẵn bộ test (Jest + Supertest), cấu hình trong backend/package.json:

cd backend
npm test

Test chạy tuần tự (--runInBand) — tránh xung đột khi nhiều test cùng thao tác vào 1 database dùng chung. Có file setup riêng tại backend/tests/setup.js và mock tại backend/tests/__mocks__/ — mở 2 file/thư mục này nếu cần hiểu cách test được khởi tạo (ví dụ DB test riêng hay dùng chung DB dev).

🩹 Xử lý lỗi thường gặp

1. Backend không kết nối được SQL Server

	•	Kiểm tra SQL Server đã bật chưa, đã bật Mixed Mode Authentication chưa (xem lại bước 2).
	•	Kiểm tra đúng DB_HOST, DB_USER, DB_PASSWORD trong backend/.env.
	•	Nếu dùng named instance (vd SQLEXPRESS): đặt DB_HOST=localhost\SQLEXPRESS và xoá dòng DB_PORT — để SQL Server Browser tự resolve port.

2. Frontend gọi API bị lỗi / CORS

	•	Kiểm tra FRONTEND_URL trong backend/.env khớp đúng địa chỉ frontend (http://localhost:3000).
	•	Kiểm tra biến API URL phía frontend (xem phần 4 ở trên) trỏ đúng http://localhost:5000.

3. Tính năng AI không hoạt động

	•	Kiểm tra GROQ_API_KEY trong backend/.env đã điền đúng key thật (lấy tại console.groq.com/keys), không phải giá trị mẫu.

4. Email nhắc nhở không gửi được

	•	Các biến SMTP_* để trống mặc định — cần điền đầy đủ SMTP_HOST, SMTP_USER, SMTP_PASSWORD mới gửi được. Nếu dùng Gmail, dùng App Password, không dùng mật khẩu tài khoản thường.

5. Chạy nhầm schema MySQL cũ

	•	Nếu đã lỡ chạy full_database.sql vào SQL Server và gặp lỗi cú pháp hàng loạt — đó là vì file đó viết cho MySQL, không tương thích. Xoá database vừa tạo, chạy lại đúng backend/database/mssql_schema.sql.

⚠️ Ghi chú quan trọng

	•	JWT_SECRET, REFRESH_TOKEN_SECRET, DB_PASSWORD, GROQ_API_KEY: không commit giá trị thật vào git, không để nguyên giá trị mẫu khi deploy thật.
	•	Repo hiện có file tài khoản.md (tài khoản demo) và IMPORT_DATABASE.txt (hướng dẫn import DB) nằm rời rạc ở gốc project — nội dung của cả 2 đã được gộp vào README này, có thể giữ file gốc để tham khảo hoặc xoá bớt cho gọn.
	•	File .env (thật) đã được .gitignore chặn — không commit lên git.
