-- MySQL dump 10.13  Distrib 9.4.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: it_asset_management
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `description` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,1,'login',NULL,NULL,'User logged in','::1','2025-11-20 10:07:46'),(2,1,'login',NULL,NULL,'User logged in','::1','2025-11-20 10:08:27'),(3,1,'login',NULL,NULL,'User logged in','::1','2025-11-20 10:13:08'),(4,1,'login',NULL,NULL,'User logged in','::1','2025-11-20 10:13:39'),(5,1,'create','asset',9,'Created asset: Test Laptop',NULL,'2025-11-20 10:15:21'),(6,1,'update','asset',9,'Updated asset ID: 9',NULL,'2025-11-20 10:15:32'),(7,1,'assign','asset',2,'Assigned asset to user ID: 2',NULL,'2025-11-20 10:15:56'),(8,1,'return','asset',2,'Asset returned from assignment ID: 5',NULL,'2025-11-20 10:16:07'),(9,1,'create','maintenance',6,'Created maintenance record for asset ID: 9',NULL,'2025-11-20 10:16:47'),(10,2,'login',NULL,NULL,'User logged in','::1','2025-11-20 10:18:31'),(11,3,'login',NULL,NULL,'User logged in','::1','2025-11-20 10:19:03');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_assignments`
--

DROP TABLE IF EXISTS `asset_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int NOT NULL,
  `user_id` int NOT NULL,
  `assigned_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('active','returned','overdue') DEFAULT 'active',
  `notes` text,
  `assigned_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `asset_id` (`asset_id`),
  KEY `user_id` (`user_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `asset_assignments_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`),
  CONSTRAINT `asset_assignments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `asset_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_assignments`
--

LOCK TABLES `asset_assignments` WRITE;
/*!40000 ALTER TABLE `asset_assignments` DISABLE KEYS */;
INSERT INTO `asset_assignments` VALUES (1,1,2,'2023-01-20',NULL,'active','Phân bổ cho IT Staff',1,'2025-11-20 10:09:52','2025-11-20 10:09:52'),(2,3,3,'2022-11-15',NULL,'active','Phân bổ cho nhân viên kế toán',1,'2025-11-20 10:09:52','2025-11-20 10:09:52'),(3,5,3,'2022-08-20',NULL,'active','Màn hình phụ cho marketing',1,'2025-11-20 10:09:52','2025-11-20 10:09:52'),(4,7,1,'2023-06-25',NULL,'active','Điện thoại công ty cho giám đốc',1,'2025-11-20 10:09:52','2025-11-20 10:09:52'),(5,2,2,'2024-01-20','2024-01-25','returned','Test assignment\nReturned in good condition',1,'2025-11-20 10:15:56','2025-11-20 10:16:07');
/*!40000 ALTER TABLE `asset_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_categories`
--

DROP TABLE IF EXISTS `asset_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asset_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_categories`
--

LOCK TABLES `asset_categories` WRITE;
/*!40000 ALTER TABLE `asset_categories` DISABLE KEYS */;
INSERT INTO `asset_categories` VALUES (1,'Máy tính','Máy tính xách tay và máy tính để bàn'),(2,'Thiết bị mạng','Router, Switch, Access Point'),(3,'Thiết bị văn phòng','Máy in, máy scan, máy photocopy'),(4,'Thiết bị di động','Điện thoại, máy tính bảng'),(5,'Phụ kiện','Chuột, bàn phím, tai nghe');
/*!40000 ALTER TABLE `asset_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assets`
--

DROP TABLE IF EXISTS `assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `category_id` int DEFAULT NULL,
  `type` enum('laptop','desktop','monitor','printer','phone','tablet','other') NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `warranty_expiry` date DEFAULT NULL,
  `status` enum('available','in_use','maintenance','broken','disposed') DEFAULT 'available',
  `condition_status` enum('new','good','fair','poor') DEFAULT 'good',
  `purchase_price` decimal(15,2) DEFAULT NULL,
  `current_value` decimal(15,2) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `notes` text,
  `qr_code` text,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_code` (`asset_code`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `asset_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assets`
--

LOCK TABLES `assets` WRITE;
/*!40000 ALTER TABLE `assets` DISABLE KEYS */;
INSERT INTO `assets` VALUES (1,'LT001','MacBook Pro 16 inch',1,'laptop','Apple','MacBook Pro 16\"','C02XG0FDH7JY','2023-01-15','2026-01-15','in_use','good',50000000.00,45000000.00,'Phòng IT','Laptop cho nhân viên IT',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),(2,'LT002','Dell Latitude 5420',1,'laptop','Dell','Latitude 5420','DL5420-001','2023-03-20','2026-03-20','available','good',25000000.00,22000000.00,'Kho thiết bị','Laptop dự phòng',NULL,'2025-11-20 10:09:52','2025-11-20 10:16:07'),(3,'DT001','HP EliteDesk 800 G6',1,'desktop','HP','EliteDesk 800 G6','HP800G6-001','2022-11-10','2025-11-10','in_use','good',18000000.00,15000000.00,'Phòng Kế toán','Desktop cho kế toán',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),(4,'MN001','Dell UltraSharp 27\"',1,'monitor','Dell','U2720Q','DLU27-001','2023-02-01','2026-02-01','available','new',12000000.00,11500000.00,'Kho thiết bị','Màn hình 4K',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),(5,'MN002','LG 24\" Monitor',1,'monitor','LG','24MK430H','LG24-001','2022-08-15','2025-08-15','in_use','fair',3500000.00,2500000.00,'Phòng Marketing','Màn hình phụ',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),(6,'PR001','HP LaserJet Pro M404dn',3,'printer','HP','LaserJet Pro M404dn','HPM404-001','2023-05-10','2026-05-10','available','good',8000000.00,7500000.00,'Phòng hành chính','Máy in văn phòng',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),(7,'PH001','iPhone 13 Pro',4,'phone','Apple','iPhone 13 Pro','IP13P-001','2023-06-20','2024-06-20','in_use','good',28000000.00,22000000.00,'Giám đốc','Điện thoại công ty',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),(8,'TB001','iPad Air 2022',4,'tablet','Apple','iPad Air','IPAD-001','2023-04-15','2024-04-15','maintenance','fair',15000000.00,13000000.00,'Bảo trì','Cần thay màn hình',NULL,'2025-11-20 10:09:52','2025-11-20 10:09:52'),(9,'TEST001','Updated Test Laptop',NULL,'laptop','Dell','Test Model',NULL,NULL,NULL,'available','good',NULL,NULL,'Test Room',NULL,'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKYSURBVO3BQW7sWAwEwSxC979yjpdcPUCQusfmZ0T8wRqjWKMUa5RijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoFw8l4ZtUuiTcoXJHEr5J5YlijVKsUYo1ysXLVN6UhBOVb1J5UxLeVKxRijVKsUa5+LAk3KHySUk4UbkjCXeofFKxRinWKMUa5eKPS0Kn0iWhU+mSMEmxRinWKMUa5WKYJPzLijVKsUYp1igXH6byTSonSehUnlD5TYo1SrFGKdYoFy9Lwm+ShE6lS0KncpKE36xYoxRrlGKNEn/whyXhTSp/WbFGKdYoxRrl4qEkdCp3JKFT6ZJwh8pJEjqVLglvUjlJQqfyRLFGKdYoxRrl4mVJuEOlS0KncpKEkyScJKFTOUlCp/KEypuKNUqxRinWKBcvU7kjCSdJ+CSVkyScJOEJlTcVa5RijVKsUS5eloRO5QmVLgmdSpeETuWOJJyodEk4UTlJQqfyRLFGKdYoxRol/uCBJDyh0iXhRKVLwh0qXRLuUDlJwhMqTxRrlGKNUqxRLh5SeZPKEyr/J5UuCZ1Kl4Q3FWuUYo1SrFEuHkrCN6l8k8odSThJwicVa5RijVKsUS5epvKmJJyo3JGEE5WTJHQqJypdEj6pWKMUa5RijXLxYUm4Q+WOJHQqXRJOVE6ScJKETqVLwjcVa5RijVKsUS7+OJUuCZ1Kl4QuCZ1Kp/KXFGuUYo1SrFEu/nEqJ0l4QuWbijVKsUYp1igXH6byTSonKidJOFHpkvBEEjqVJ4o1SrFGKdYoFy9LwjcloVO5IwlPqJwk4ZuKNUqxRinWKPEHa4xijVKsUYo1SrFGKdYoxRqlWKMUa5RijVKsUYo1SrFGKdYoxRqlWKP8B3xi6/WRFaJPAAAAAElFTkSuQmCC','2025-11-20 10:15:21','2025-11-20 10:15:32');
/*!40000 ALTER TABLE `assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_records`
--

DROP TABLE IF EXISTS `maintenance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int NOT NULL,
  `maintenance_type` enum('repair','inspection','upgrade','cleaning','other') NOT NULL,
  `description` text NOT NULL,
  `cost` decimal(15,2) DEFAULT NULL,
  `maintenance_date` date NOT NULL,
  `performed_by` varchar(100) DEFAULT NULL,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `asset_id` (`asset_id`),
  CONSTRAINT `maintenance_records_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_records`
--

LOCK TABLES `maintenance_records` WRITE;
/*!40000 ALTER TABLE `maintenance_records` DISABLE KEYS */;
INSERT INTO `maintenance_records` VALUES (1,1,'cleaning','Vệ sinh và kiểm tra định kỳ',500000.00,'2023-07-15','Nguyễn Văn A','completed','Đã vệ sinh và kiểm tra tổng thể','2025-11-20 10:09:52','2025-11-20 10:09:52'),(2,3,'upgrade','Nâng cấp RAM từ 8GB lên 16GB',2000000.00,'2023-09-10','Trần Văn B','completed','Nâng cấp RAM để tăng hiệu suất','2025-11-20 10:09:52','2025-11-20 10:09:52'),(3,8,'repair','Thay màn hình iPad bị vỡ',3500000.00,'2024-01-10','Lê Thị C','in_progress','Đang chờ linh kiện','2025-11-20 10:09:52','2025-11-20 10:09:52'),(4,1,'inspection','Kiểm tra định kỳ 6 tháng',0.00,'2024-01-20','Nguyễn Văn A','completed','Thiết bị hoạt động tốt','2025-11-20 10:09:52','2025-11-20 10:09:52'),(5,7,'repair','Thay pin iPhone',1500000.00,'2023-12-05','Phạm Văn D','completed','Đã thay pin mới','2025-11-20 10:09:52','2025-11-20 10:09:52'),(6,9,'inspection','Test inspection',500000.00,'2024-01-20','Test Tech','completed',NULL,'2025-11-20 10:16:47','2025-11-20 10:16:47');
/*!40000 ALTER TABLE `maintenance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('admin','it_staff','regular_user') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$mbMIzpvMndkixGcokzYT3OY72RAx3TAkBkB7tPMk4V92xew8kSAry','Administrator','admin@example.com','admin','2025-11-20 09:58:06','2025-11-20 09:58:39'),(2,'itstaff','$2a$10$BpmzSi8WB34emQReoG95FOeo.9mAhd6MC0OND4GFAkyeky9hCPlyO','IT Staff User','itstaff@example.com','it_staff','2025-11-20 10:09:15','2025-11-20 10:09:15'),(3,'user','$2a$10$LUDzGhCDQUggY2r1WyhzHONfjfQCvzO42qX3oMr.KLE1.ewS6s2wa','Regular User','user@example.com','regular_user','2025-11-20 10:09:15','2025-11-20 10:09:15');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-20 17:23:27
