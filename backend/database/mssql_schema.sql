/*
  IT ASSET MANAGEMENT - SQL SERVER SCHEMA + SEED DATA
  Chuyển đổi từ full_database.sql (MySQL) sang T-SQL cho SQL Server.

  CÁCH DÙNG:
  1. Mở SSMS -> Connect tới instance của bạn.
  2. Mở file này (File > Open > File...) hoặc copy toàn bộ nội dung vào 1 New Query.
  3. Nhấn Execute (F5). Script sẽ tự tạo database "it_asset_management" và toàn bộ bảng + dữ liệu mẫu.
*/

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'it_asset_management')
BEGIN
    CREATE DATABASE it_asset_management;
END
GO

USE it_asset_management;
GO

-- ============================================================
-- DROP BẢNG CŨ (theo đúng thứ tự để không vi phạm khóa ngoại)
-- ============================================================
IF OBJECT_ID('dbo.maintenance_records', 'U') IS NOT NULL DROP TABLE dbo.maintenance_records;
IF OBJECT_ID('dbo.asset_assignments', 'U') IS NOT NULL DROP TABLE dbo.asset_assignments;
IF OBJECT_ID('dbo.activity_logs', 'U') IS NOT NULL DROP TABLE dbo.activity_logs;
IF OBJECT_ID('dbo.assets', 'U') IS NOT NULL DROP TABLE dbo.assets;
IF OBJECT_ID('dbo.asset_categories', 'U') IS NOT NULL DROP TABLE dbo.asset_categories;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
GO

-- ============================================================
-- BẢNG users
-- ============================================================
CREATE TABLE dbo.users (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    username     NVARCHAR(50)  NOT NULL,
    password     NVARCHAR(255) NOT NULL,
    full_name    NVARCHAR(100) NOT NULL,
    email        NVARCHAR(100) NULL,
    role         NVARCHAR(20)  NOT NULL,
    is_active    BIT           NOT NULL DEFAULT 1,
    created_at   DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    updated_at   DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_users_username UNIQUE (username),
    CONSTRAINT CK_users_role CHECK (role IN ('admin','it_staff','regular_user'))
);
GO

-- ============================================================
-- BẢNG asset_categories
-- ============================================================
CREATE TABLE dbo.asset_categories (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NULL
);
GO

-- ============================================================
-- BẢNG assets
-- ============================================================
CREATE TABLE dbo.assets (
    id                INT IDENTITY(1,1) PRIMARY KEY,
    asset_code        NVARCHAR(50)  NOT NULL,
    name              NVARCHAR(200) NOT NULL,
    category_id       INT NULL,
    type              NVARCHAR(20)  NOT NULL,
    brand             NVARCHAR(100) NULL,
    model             NVARCHAR(100) NULL,
    serial_number     NVARCHAR(100) NULL,
    purchase_date     DATE NULL,
    warranty_expiry   DATE NULL,
    status            NVARCHAR(20)  NOT NULL DEFAULT 'available',
    condition_status  NVARCHAR(10)  NOT NULL DEFAULT 'good',
    purchase_price    DECIMAL(15,2) NULL,
    current_value     DECIMAL(15,2) NULL,
    location          NVARCHAR(200) NULL,
    notes             NVARCHAR(MAX) NULL,
    qr_code           NVARCHAR(MAX) NULL,
    image_url         NVARCHAR(500) NULL,
    created_at        DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at        DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_assets_code UNIQUE (asset_code),
    CONSTRAINT FK_assets_category FOREIGN KEY (category_id) REFERENCES dbo.asset_categories(id),
    CONSTRAINT CK_assets_type CHECK (type IN ('laptop','desktop','monitor','printer','phone','tablet','other')),
    CONSTRAINT CK_assets_status CHECK (status IN ('available','in_use','maintenance','broken','disposed')),
    CONSTRAINT CK_assets_condition CHECK (condition_status IN ('new','good','fair','poor'))
);
GO

-- ============================================================
-- BẢNG asset_assignments
-- ============================================================
CREATE TABLE dbo.asset_assignments (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    asset_id      INT NOT NULL,
    user_id       INT NOT NULL,
    assigned_date DATE NOT NULL,
    return_date   DATE NULL,
    status        NVARCHAR(20) NOT NULL DEFAULT 'active',
    notes         NVARCHAR(MAX) NULL,
    assigned_by   INT NULL,
    created_at    DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at    DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_assignments_asset FOREIGN KEY (asset_id) REFERENCES dbo.assets(id),
    CONSTRAINT FK_assignments_user FOREIGN KEY (user_id) REFERENCES dbo.users(id),
    CONSTRAINT FK_assignments_assignedby FOREIGN KEY (assigned_by) REFERENCES dbo.users(id),
    CONSTRAINT CK_assignments_status CHECK (status IN ('active','returned','overdue'))
);
GO

-- ============================================================
-- BẢNG maintenance_records
-- ============================================================
CREATE TABLE dbo.maintenance_records (
    id                INT IDENTITY(1,1) PRIMARY KEY,
    asset_id          INT NOT NULL,
    maintenance_type  NVARCHAR(20) NOT NULL,
    description       NVARCHAR(MAX) NOT NULL,
    cost              DECIMAL(15,2) NULL,
    maintenance_date  DATE NOT NULL,
    performed_by      NVARCHAR(100) NULL,
    status            NVARCHAR(20) NOT NULL DEFAULT 'pending',
    notes             NVARCHAR(MAX) NULL,
    created_at        DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at        DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_maintenance_asset FOREIGN KEY (asset_id) REFERENCES dbo.assets(id),
    CONSTRAINT CK_maintenance_type CHECK (maintenance_type IN ('repair','inspection','upgrade','cleaning','other')),
    CONSTRAINT CK_maintenance_status CHECK (status IN ('pending','in_progress','completed','cancelled'))
);
GO

-- ============================================================
-- BẢNG activity_logs
-- ============================================================
CREATE TABLE dbo.activity_logs (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    user_id      INT NULL,
    action       NVARCHAR(100) NOT NULL,
    entity_type  NVARCHAR(50) NULL,
    entity_id    INT NULL,
    description  NVARCHAR(MAX) NULL,
    ip_address   NVARCHAR(45) NULL,
    created_at   DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_logs_user FOREIGN KEY (user_id) REFERENCES dbo.users(id)
);
GO

-- ============================================================
-- TRIGGER tự cập nhật updated_at (thay cho ON UPDATE CURRENT_TIMESTAMP của MySQL)
-- ============================================================
CREATE TRIGGER trg_users_updated_at ON dbo.users
AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE u SET updated_at = SYSDATETIME()
    FROM dbo.users u INNER JOIN inserted i ON u.id = i.id;
END
GO

CREATE TRIGGER trg_assets_updated_at ON dbo.assets
AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE a SET updated_at = SYSDATETIME()
    FROM dbo.assets a INNER JOIN inserted i ON a.id = i.id;
END
GO

CREATE TRIGGER trg_assignments_updated_at ON dbo.asset_assignments
AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE t SET updated_at = SYSDATETIME()
    FROM dbo.asset_assignments t INNER JOIN inserted i ON t.id = i.id;
END
GO

CREATE TRIGGER trg_maintenance_updated_at ON dbo.maintenance_records
AFTER UPDATE AS
BEGIN
    SET NOCOUNT ON;
    UPDATE m SET updated_at = SYSDATETIME()
    FROM dbo.maintenance_records m INNER JOIN inserted i ON m.id = i.id;
END
GO

-- ============================================================
-- DỮ LIỆU MẪU
-- ============================================================

SET IDENTITY_INSERT dbo.users ON;
INSERT INTO dbo.users (id, username, password, full_name, email, role, created_at, updated_at) VALUES
(1,'admin','$2a$10$mbMIzpvMndkixGcokzYT3OY72RAx3TAkBkB7tPMk4V92xew8kSAry','Administrator','admin@example.com','admin','2025-11-20 09:58:06','2025-11-20 09:58:39'),
(2,'itstaff','$2a$10$BpmzSi8WB34emQReoG95FOeo.9mAhd6MC0OND4GFAkyeky9hCPlyO','IT Staff User','itstaff@example.com','it_staff','2025-11-20 10:09:15','2025-11-20 10:09:15'),
(3,'user','$2a$10$LUDzGhCDQUggY2r1WyhzHONfjfQCvzO42qX3oMr.KLE1.ewS6s2wa','Regular User','user@example.com','regular_user','2025-11-20 10:09:15','2025-11-20 10:09:15');
SET IDENTITY_INSERT dbo.users OFF;
GO

SET IDENTITY_INSERT dbo.asset_categories ON;
INSERT INTO dbo.asset_categories (id, name, description) VALUES
(1,N'Máy tính',N'Máy tính xách tay và máy tính để bàn'),
(2,N'Thiết bị mạng',N'Router, Switch, Access Point'),
(3,N'Thiết bị văn phòng',N'Máy in, máy scan, máy photocopy'),
(4,N'Thiết bị di động',N'Điện thoại, máy tính bảng'),
(5,N'Phụ kiện',N'Chuột, bàn phím, tai nghe');
SET IDENTITY_INSERT dbo.asset_categories OFF;
GO

SET IDENTITY_INSERT dbo.assets ON;
INSERT INTO dbo.assets (id, asset_code, name, category_id, type, brand, model, serial_number, purchase_date, warranty_expiry, status, condition_status, purchase_price, current_value, location, notes, qr_code, created_at, updated_at) VALUES
(1,'LT001',N'MacBook Pro 16 inch',1,'laptop','Apple','MacBook Pro 16"','C02XG0FDH7JY','2023-01-15','2026-01-15','in_use','good',50000000.00,45000000.00,N'Phòng IT',N'Laptop cho nhân viên IT',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),
(2,'LT002',N'Dell Latitude 5420',1,'laptop','Dell','Latitude 5420','DL5420-001','2023-03-20','2026-03-20','available','good',25000000.00,22000000.00,N'Kho thiết bị',N'Laptop dự phòng',NULL,'2025-11-20 10:09:52','2025-11-20 10:16:07'),
(3,'DT001',N'HP EliteDesk 800 G6',1,'desktop','HP','EliteDesk 800 G6','HP800G6-001','2022-11-10','2025-11-10','in_use','good',18000000.00,15000000.00,N'Phòng Kế toán',N'Desktop cho kế toán',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),
(4,'MN001',N'Dell UltraSharp 27"',1,'monitor','Dell','U2720Q','DLU27-001','2023-02-01','2026-02-01','available','new',12000000.00,11500000.00,N'Kho thiết bị',N'Màn hình 4K',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),
(5,'MN002',N'LG 24" Monitor',1,'monitor','LG','24MK430H','LG24-001','2022-08-15','2025-08-15','in_use','fair',3500000.00,2500000.00,N'Phòng Marketing',N'Màn hình phụ',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),
(6,'PR001',N'HP LaserJet Pro M404dn',3,'printer','HP','LaserJet Pro M404dn','HPM404-001','2023-05-10','2026-05-10','available','good',8000000.00,7500000.00,N'Phòng hành chính',N'Máy in văn phòng',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),
(7,'PH001',N'iPhone 13 Pro',4,'phone','Apple','iPhone 13 Pro','IP13P-001','2023-06-20','2024-06-20','in_use','good',28000000.00,22000000.00,N'Giám đốc',N'Điện thoại công ty',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),
(8,'TB001',N'iPad Air 2022',4,'tablet','Apple','iPad Air','IPAD-001','2023-04-15','2024-04-15','maintenance','fair',15000000.00,13000000.00,N'Bảo trì',N'Cần thay màn hình',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),
(9,'TEST001',N'Updated Test Laptop',NULL,'laptop','Dell','Test Model',NULL,NULL,NULL,'available','good',NULL,NULL,N'Test Room',NULL,NULL,'2025-11-20 10:15:21','2025-11-20 10:15:32');
SET IDENTITY_INSERT dbo.assets OFF;
GO

SET IDENTITY_INSERT dbo.asset_assignments ON;
INSERT INTO dbo.asset_assignments (id, asset_id, user_id, assigned_date, return_date, status, notes, assigned_by, created_at, updated_at) VALUES
(1,1,2,'2023-01-20',NULL,'active',N'Phân bổ cho IT Staff',1,'2025-11-20 10:09:52','2025-11-20 10:09:52'),
(2,3,3,'2022-11-15',NULL,'active',N'Phân bổ cho nhân viên kế toán',1,'2025-11-20 10:09:52','2025-11-20 10:09:52'),
(3,5,3,'2022-08-20',NULL,'active',N'Màn hình phụ cho marketing',1,'2025-11-20 10:09:52','2025-11-20 10:09:52'),
(4,7,1,'2023-06-25',NULL,'active',N'Điện thoại công ty cho giám đốc',1,'2025-11-20 10:09:52','2025-11-20 10:09:52'),
(5,2,2,'2024-01-20','2024-01-25','returned',N'Test assignment
Returned in good condition',1,'2025-11-20 10:15:56','2025-11-20 10:16:07');
SET IDENTITY_INSERT dbo.asset_assignments OFF;
GO

SET IDENTITY_INSERT dbo.maintenance_records ON;
INSERT INTO dbo.maintenance_records (id, asset_id, maintenance_type, description, cost, maintenance_date, performed_by, status, notes, created_at, updated_at) VALUES
(1,1,'cleaning',N'Vệ sinh và kiểm tra định kỳ',500000.00,'2023-07-15',N'Nguyễn Văn A','completed',N'Đã vệ sinh và kiểm tra tổng thể','2025-11-20 10:09:52','2025-11-20 10:09:52'),
(2,3,'upgrade',N'Nâng cấp RAM từ 8GB lên 16GB',2000000.00,'2023-09-10',N'Trần Văn B','completed',N'Nâng cấp RAM để tăng hiệu suất','2025-11-20 10:09:52','2025-11-20 10:09:52'),
(3,8,'repair',N'Thay màn hình iPad bị vỡ',3500000.00,'2024-01-10',N'Lê Thị C','in_progress',N'Đang chờ linh kiện','2025-11-20 10:09:52','2025-11-20 10:09:52'),
(4,1,'inspection',N'Kiểm tra định kỳ 6 tháng',0.00,'2024-01-20',N'Nguyễn Văn A','completed',N'Thiết bị hoạt động tốt','2025-11-20 10:09:52','2025-11-20 10:09:52'),
(5,7,'repair',N'Thay pin iPhone',1500000.00,'2023-12-05',N'Phạm Văn D','completed',N'Đã thay pin mới','2025-11-20 10:09:52','2025-11-20 10:09:52'),
(6,9,'inspection',N'Test inspection',500000.00,'2024-01-20',N'Test Tech','completed',NULL,'2025-11-20 10:16:47','2025-11-20 10:16:47');
SET IDENTITY_INSERT dbo.maintenance_records OFF;
GO

SET IDENTITY_INSERT dbo.activity_logs ON;
INSERT INTO dbo.activity_logs (id, user_id, action, entity_type, entity_id, description, ip_address, created_at) VALUES
(1,1,'login',NULL,NULL,N'User logged in','::1','2025-11-20 10:07:46'),
(2,1,'login',NULL,NULL,N'User logged in','::1','2025-11-20 10:08:27'),
(3,1,'login',NULL,NULL,N'User logged in','::1','2025-11-20 10:13:08'),
(4,1,'login',NULL,NULL,N'User logged in','::1','2025-11-20 10:13:39'),
(5,1,'create','asset',9,N'Created asset: Test Laptop',NULL,'2025-11-20 10:15:21'),
(6,1,'update','asset',9,N'Updated asset ID: 9',NULL,'2025-11-20 10:15:32'),
(7,1,'assign','asset',2,N'Assigned asset to user ID: 2',NULL,'2025-11-20 10:15:56'),
(8,1,'return','asset',2,N'Asset returned from assignment ID: 5',NULL,'2025-11-20 10:16:07'),
(9,1,'create','maintenance',6,N'Created maintenance record for asset ID: 9',NULL,'2025-11-20 10:16:47'),
(10,2,'login',NULL,NULL,N'User logged in','::1','2025-11-20 10:18:31'),
(11,3,'login',NULL,NULL,N'User logged in','::1','2025-11-20 10:19:03');
SET IDENTITY_INSERT dbo.activity_logs OFF;
GO

PRINT N'✅ Đã tạo xong database it_asset_management (SQL Server) và import dữ liệu mẫu.';
GO
