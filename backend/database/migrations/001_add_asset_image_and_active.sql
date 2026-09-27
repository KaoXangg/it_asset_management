-- Migration: thêm cột image_url cho bảng assets, is_active cho users
-- Chạy 1 lần nếu database đã tồn tại từ trước (không cần nếu bạn tạo DB mới từ mssql_schema.sql)

IF NOT EXISTS (
    SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.assets') AND name = 'image_url'
)
BEGIN
    ALTER TABLE dbo.assets ADD image_url NVARCHAR(500) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'is_active'
)
BEGIN
    ALTER TABLE dbo.users ADD is_active BIT NOT NULL DEFAULT 1;
END
GO
