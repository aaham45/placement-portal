-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: placement_portal
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `admin_achievements`
--

DROP TABLE IF EXISTS `admin_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `achievement` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  CONSTRAINT `admin_achievements_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_achievements`
--

LOCK TABLES `admin_achievements` WRITE;
/*!40000 ALTER TABLE `admin_achievements` DISABLE KEYS */;
INSERT INTO `admin_achievements` VALUES (3,2,'Placement Portal Setup','2026-07-31','2026-07-31 13:45:42'),(4,2,'Placement Portal Setup','2026-07-31','2026-07-31 13:47:03');
/*!40000 ALTER TABLE `admin_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` int DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_logs`
--

LOCK TABLES `admin_logs` WRITE;
/*!40000 ALTER TABLE `admin_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_profiles`
--

DROP TABLE IF EXISTS `admin_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Administrator',
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Placement Cell',
  `employee_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `profile_pic` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_email` (`email`),
  CONSTRAINT `admin_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_profiles`
--

LOCK TABLES `admin_profiles` WRITE;
/*!40000 ALTER TABLE `admin_profiles` DISABLE KEYS */;
INSERT INTO `admin_profiles` VALUES (2,12,'Admin','aahamsonu1@gmail.com','+91 7761853789','Administrator','Placement Celll','ADMIN001','2026-07-31','Bhubaneswar, Odisha','Placement Portal Administrator',NULL,'2026-07-31 13:45:42','2026-08-02 15:06:29');
/*!40000 ALTER TABLE `admin_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_settings`
--

DROP TABLE IF EXISTS `admin_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int DEFAULT NULL,
  `site_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Placement Portal',
  `site_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site_address` text COLLATE utf8mb4_unicode_ci,
  `timezone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Asia/Kolkata',
  `date_format` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'DD/MM/YYYY',
  `language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'en',
  `email_notifications` tinyint(1) DEFAULT '1',
  `push_notifications` tinyint(1) DEFAULT '1',
  `sms_notifications` tinyint(1) DEFAULT '0',
  `new_company_alert` tinyint(1) DEFAULT '1',
  `new_job_alert` tinyint(1) DEFAULT '1',
  `student_registration_alert` tinyint(1) DEFAULT '1',
  `placement_drive_alert` tinyint(1) DEFAULT '1',
  `weekly_digest` tinyint(1) DEFAULT '0',
  `two_factor_auth` tinyint(1) DEFAULT '0',
  `session_timeout` int DEFAULT '60',
  `max_login_attempts` int DEFAULT '5',
  `password_expiry_days` int DEFAULT '90',
  `ip_whitelist` text COLLATE utf8mb4_unicode_ci,
  `theme` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'light',
  `primary_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#059669',
  `font_size` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `compact_view` tinyint(1) DEFAULT '0',
  `animations_enabled` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `admin_settings_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_settings`
--

LOCK TABLES `admin_settings` WRITE;
/*!40000 ALTER TABLE `admin_settings` DISABLE KEYS */;
INSERT INTO `admin_settings` VALUES (1,NULL,'Placement Portal','aahamsonu@gmail.com',NULL,NULL,'Asia/Kolkata','DD/MM/YYYY','en',1,1,0,1,1,1,1,0,0,60,5,90,NULL,'light','#059669','medium',0,1,'2026-07-31 10:53:31','2026-07-31 10:53:31'),(2,2,'CUTM Placement Portal','aahamsonu1@gmail.com','7761853789','Kazichak, Bodhgaya Gaya Bihar','Asia/Kolkata','DD/MM/YYYY','en',1,1,1,1,1,1,1,1,0,60,10,90,'','light','#8b5cf6','medium',1,1,'2026-07-31 16:28:43','2026-08-02 16:09:23');
/*!40000 ALTER TABLE `admin_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_stats`
--

DROP TABLE IF EXISTS `admin_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `students_placed` int DEFAULT '0',
  `companies_onboarded` int DEFAULT '0',
  `placement_drives` int DEFAULT '0',
  `avg_package` decimal(10,2) DEFAULT '0.00',
  `month` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_month` (`month`),
  CONSTRAINT `admin_stats_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_stats`
--

LOCK TABLES `admin_stats` WRITE;
/*!40000 ALTER TABLE `admin_stats` DISABLE KEYS */;
INSERT INTO `admin_stats` VALUES (2,2,0,1,0,0.00,'2026-07-31','2026-07-31 13:45:42','2026-07-31 13:45:42'),(3,2,0,1,0,0.00,'2026-07-31','2026-07-31 13:47:03','2026-07-31 13:47:03');
/*!40000 ALTER TABLE `admin_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `student_id` int NOT NULL,
  `student_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registration_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `program` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `branch` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cgpa` decimal(3,1) DEFAULT NULL,
  `company_id` int NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `resume_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cover_letter` text COLLATE utf8mb4_unicode_ci,
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_job_id` (`job_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `applications_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (96,28,2,'AAHAM KUMR ARYA','230101120045','230101120045@centurionuniv.edu.in','B.Tech','CSE',10.0,4,'selected',NULL,NULL,'2026-08-15 13:15:32','2026-08-15 19:10:21'),(105,28,36,'Priya Sharma','230101120001','priya@student.com','B.Tech','CSE',8.5,4,'selected',NULL,NULL,'2026-08-15 13:54:56','2026-08-16 11:25:48'),(106,28,37,'Raj Kumar','230101120002','raj@student.com','B.Tech','IT',7.8,4,'selected',NULL,NULL,'2026-08-15 13:54:56','2026-08-16 11:25:49'),(107,28,38,'Sneha Patel','230101120003','sneha@student.com','B.Tech','ECE',8.2,4,'applied',NULL,NULL,'2026-08-15 13:54:56','2026-08-15 13:54:56'),(108,28,39,'Amit Verma','230101120004','amit@student.com','B.Tech','MECH',6.5,4,'applied',NULL,NULL,'2026-08-15 13:54:56','2026-08-15 13:54:56'),(109,28,40,'Neha Singh','230101120005','neha@student.com','B.Tech','CSE',9.2,4,'selected',NULL,NULL,'2026-08-15 13:54:56','2026-08-16 11:25:50'),(110,28,41,'Vikram Reddy','230101120006','vikram@student.com','B.Tech','IT',7.2,4,'applied',NULL,NULL,'2026-08-15 13:54:56','2026-08-15 13:54:56'),(111,28,42,'Ananya Gupta','230101120007','ananya@student.com','B.Tech','CSE',8.8,4,'applied',NULL,NULL,'2026-08-15 13:54:56','2026-08-15 13:54:56'),(112,28,43,'Rohit Kumar','230101120008','rohit@student.com','B.Tech','EEE',6.2,4,'shortlisted',NULL,NULL,'2026-08-15 13:54:57','2026-08-16 15:04:33'),(113,29,2,'AAHAM KUMR ARYA','230101120045','230101120045@centurionuniv.edu.in','B.Tech','CSE',10.0,4,'selected',NULL,'Dear Hiring Team,\n\nI am writing to express my strong interest in the Web Developer position at Amazon India. As a CSE student with a CGPA of 10.0, I have developed a solid foundation in full-stack development and am eager to apply my skills in a professional environment.\n\nThroughout my academic journey, I have gained hands-on experience in React, Node.js, Python, and MySQL. I have successfully completed projects such as E-commerce Website and Chat Application, where I utilized modern web technologies to solve real-world problems. I am particularly drawn to Amazon India because of its reputation for innovation and I believe my technical skills align perfectly with the requirements of this role.\n\nI am particularly excited about the opportunity to work at Amazon India because of your commitment to customer-centric innovation. I have been following your work in e-commerce and cloud computing and I am inspired by your recent achievements in AI-powered recommendations. I am confident that my','2026-08-15 15:39:14','2026-08-15 19:08:49'),(114,27,2,'AAHAM KUMR ARYA','230101120045','230101120045@centurionuniv.edu.in','B.Tech','CSE',10.0,4,'selected',NULL,NULL,'2026-08-16 11:49:07','2026-08-16 14:58:10');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;

DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `industry` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `jobs` int DEFAULT '0',
  `hr_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (4,15,'Amazon India','Global e-commerce leader providing innovative solutions.','IT Services','https://www.amazon.in',NULL,'hr@amazon.in','+91 9876543210','Bengaluru, Karnataka, India','approved','2026-07-31 13:48:05','2026-08-11 17:59:19',6,'Jeff Bezos','Bengaluru, Karnataka, India','+91 9876543210');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_profiles`
--

DROP TABLE IF EXISTS `company_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `hr_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `employee_count` varchar(50) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `company_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_profiles`
--

LOCK TABLES `company_profiles` WRITE;
/*!40000 ALTER TABLE `company_profiles` DISABLE KEYS */;
INSERT INTO `company_profiles` VALUES (3,15,'Jeff Bezos','+91 9876543210','https://www.amazon.in','E-commerce','Bengaluru, Karnataka, India','1000+','uploads/company-logos/company_logo_15_1786471159844.jpeg');
/*!40000 ALTER TABLE `company_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interviews`
--

DROP TABLE IF EXISTS `interviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `application_id` int NOT NULL,
  `student_id` int NOT NULL,
  `company_id` int NOT NULL,
  `scheduled_date` datetime DEFAULT NULL,
  `scheduled_time` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode` enum('online','offline','hybrid') COLLATE utf8mb4_unicode_ci DEFAULT 'online',
  `interview_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Technical',
  `meeting_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `venue` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `status` enum('scheduled','completed','cancelled','rescheduled') COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `result` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_application_id` (`application_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `interviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `interviews_ibfk_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `interviews_ibfk_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interviews`
--

LOCK TABLES `interviews` WRITE;
/*!40000 ALTER TABLE `interviews` DISABLE KEYS */;
INSERT INTO `interviews` VALUES (20,113,2,4,'2026-08-15 18:47:00','00:17',NULL,'online','Technical','https://meet.google.com/jhdiqfteze','Online Meeting','Interview Type: Technical','completed','Interview completed successfully',NULL,'2026-08-15 18:44:30','2026-08-15 19:08:49'),(21,96,2,4,'2026-08-15 18:56:00','00:26',NULL,'online','Technical','https://meet.google.com/hjrnefvpil','Online Meeting','Interview Type: Technical\nLink: https://meet.google.com/kxt-tsaq-arh','completed','Interview completed successfully',NULL,'2026-08-15 18:54:30','2026-08-15 19:10:21'),(22,105,36,4,'2026-08-20 11:25:00','16:55',NULL,'online','Technical','https://meet.google.com/hdrjmsqdkt','Online Meeting','Interview Type: Technical\nLink: https://meet.google.com/qzz-wenp-asi','completed','Interview completed successfully',NULL,'2026-08-16 11:25:23','2026-08-16 11:25:48'),(23,106,37,4,'2026-08-27 11:25:00','16:55',NULL,'online','Technical','https://meet.google.com/xeoxoqbyfj','Online Meeting','Interview Type: Technical\nLink: https://meet.google.com/qzz-wenp-asi','completed','Interview completed successfully',NULL,'2026-08-16 11:25:32','2026-08-16 11:25:49'),(24,109,40,4,'2026-08-28 11:25:00','16:55',NULL,'online','Technical','https://meet.google.com/wcjqitecgi','Online Meeting','Interview Type: Technical\nLink: https://meet.google.com/qzz-wenp-asi','completed','Interview completed successfully',NULL,'2026-08-16 11:25:40','2026-08-16 11:25:49'),(25,114,2,4,'2026-08-27 14:57:00','20:27',NULL,'online','Technical','https://meet.google.com/mbjasbbmec','Online Meeting','Interview Type: Technical\nLink: https://meet.google.com/qin-nmgd-pfu','completed','Interview completed successfully',NULL,'2026-08-16 14:57:45','2026-08-16 14:58:10');
/*!40000 ALTER TABLE `interviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary_range` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `job_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Full-time',
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `application_deadline` datetime DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `skills` text COLLATE utf8mb4_unicode_ci,
  `eligibility` decimal(3,1) DEFAULT '0.0',
  `openings` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
INSERT INTO `jobs` VALUES (27,4,'Full Stack Developer','',NULL,'Noida','24 LPA','Full-time',NULL,'2026-08-20 00:00:00','active','2026-08-14 18:28:09','2026-08-14 18:28:48','HTML,CSS,JAVA,PYTHON,NODE JS,MYSQL,REACT',8.0,50),(28,4,'Web Developer','',NULL,'Mumbai','12-24 LPA','Full-time',NULL,'2026-08-18 00:00:00','active','2026-08-14 18:33:03','2026-08-14 18:33:20','React,Java,Python,MySQL,NodeJs,HTML,CSS',9.0,30),(29,4,'Frontend Developer','We are looking for a talented Web Developer to join our team. You will be responsible for building and maintaining web applications.',NULL,'Mumbai','12 LPA','Full-time',NULL,'2026-08-25 00:00:00','active','2026-08-15 14:11:38','2026-08-15 14:51:13','Java, React, Python, SQL, NodeJs, HTML, CSS',6.0,1);
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=112 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (8,15,'success','Company Registered','Your company has been registered successfully!',1,NULL,NULL,'2026-07-31 13:47:03','2026-08-11 16:53:22'),(34,12,'success','New Student Registered','Rahul Kumar has registered as a new student.',1,NULL,NULL,'2026-08-01 15:37:28','2026-08-01 15:39:40'),(35,12,'info','New Job Posted','Amazon has posted a new Software Engineer job.',1,NULL,NULL,'2026-08-01 15:37:28','2026-08-01 15:39:45'),(36,12,'warning','Placement Drive','Google Hiring Challenge is now ongoing.',1,NULL,NULL,'2026-08-01 15:37:28','2026-08-01 15:39:42'),(45,15,'info','Company Status Update','Your company registration has been rejected. Please contact support for more information.',1,NULL,NULL,'2026-08-02 10:04:57','2026-08-11 16:53:22'),(48,15,'info','Company Status Update','Your company registration has been approved! You can now post jobs.',1,NULL,NULL,'2026-08-02 10:05:02','2026-08-11 16:53:22'),(51,12,'info','New Job Posted','Microsoft has posted a new job: Software Engineer with package 25-50 LPA.',1,NULL,NULL,'2026-08-02 12:21:05','2026-08-02 14:39:14'),(52,12,'warning','Placement Drive','Google Hiring Challenge is now ongoing with 45 applications.',1,NULL,NULL,'2026-08-02 09:21:05','2026-08-02 14:39:17'),(53,12,'success','Company Approved','Google India has been approved by admin.',1,NULL,NULL,'2026-08-01 14:21:05','2026-08-02 14:39:18'),(54,12,'info','Report Generated','Monthly placement report for July 2026 has been generated.',1,NULL,NULL,'2026-08-01 14:21:05','2026-08-02 14:39:18'),(77,2,'application','Application Submitted','You have successfully applied for Web Developer',1,NULL,NULL,'2026-08-14 18:34:43',NULL),(78,2,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-20 at 07:00',1,NULL,NULL,'2026-08-14 18:38:12',NULL),(79,2,'application','Application Submitted','You have successfully applied for Full Stack Developer',1,NULL,NULL,'2026-08-15 09:06:27',NULL),(80,2,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-15 at 14:41. Join here: https://meet.google.com/evvjhegdwu',1,NULL,NULL,'2026-08-15 09:13:17',NULL),(81,2,'application','Application Submitted','You have successfully applied for Web Developer',1,NULL,NULL,'2026-08-15 09:41:45',NULL),(82,2,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-20 at 18:17',1,NULL,NULL,'2026-08-15 09:47:08',NULL),(83,2,'application','Application Submitted','You have successfully applied for Full Stack Developer',1,NULL,NULL,'2026-08-15 09:47:55',NULL),(84,2,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-20 at 15:18',1,NULL,NULL,'2026-08-15 09:48:39',NULL),(85,2,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-20 at 15:28',1,NULL,NULL,'2026-08-15 09:59:03',NULL),(86,2,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-20 at 15:31',1,NULL,NULL,'2026-08-15 09:59:47',NULL),(87,2,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-20 at 15:47. Join here: https://meet.google.com/pmplnioejm',1,NULL,NULL,'2026-08-15 10:17:26',NULL),(88,2,'application','Application Submitted','You have successfully applied for Web Developer',1,NULL,NULL,'2026-08-15 13:15:32',NULL),(89,2,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-15 at 18:48. Join here: https://meet.google.com/ztnodvjolp',1,NULL,NULL,'2026-08-15 13:18:12',NULL),(90,2,'shortlist','≡ƒÄë Congratulations! You have been Shortlisted!','You have been shortlisted for the position. Please check your dashboard for further updates.',1,NULL,NULL,'2026-08-15 13:56:07',NULL),(91,36,'shortlist','≡ƒÄë Congratulations! You have been Shortlisted!','You have been shortlisted for the position. Please check your dashboard for further updates.',0,NULL,NULL,'2026-08-15 13:58:41',NULL),(92,37,'shortlist','≡ƒÄë Congratulations! You have been Shortlisted!','You have been shortlisted for the position. Please check your dashboard for further updates.',0,NULL,NULL,'2026-08-15 13:58:41',NULL),(93,40,'shortlist','≡ƒÄë Congratulations! You have been Shortlisted!','You have been shortlisted for the position. Please check your dashboard for further updates.',0,NULL,NULL,'2026-08-15 13:58:41',NULL),(94,2,'application','Application Submitted','You have successfully applied for Frontend Developer',1,NULL,NULL,'2026-08-15 15:39:14',NULL),(95,2,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-16 at 00:17. Join here: https://meet.google.com/jhdiqfteze',1,NULL,NULL,'2026-08-15 18:44:31',NULL),(96,2,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-16 at 00:26. Join here: https://meet.google.com/hjrnefvpil',1,NULL,NULL,'2026-08-15 18:54:30',NULL),(97,2,'shortlist','≡ƒÄë You have been Shortlisted!','You have been shortlisted by Amazon India. Please check your dashboard for further updates.',1,NULL,NULL,'2026-08-16 10:40:42',NULL),(98,42,'shortlist','≡ƒÄë You have been Shortlisted!','You have been shortlisted by Amazon India. Please check your dashboard for further updates.',0,NULL,NULL,'2026-08-16 10:49:22',NULL),(99,36,'shortlist','≡ƒÄë You have been Shortlisted!','You have been shortlisted by Amazon India. Please check your dashboard for further updates.',0,NULL,NULL,'2026-08-16 10:55:08',NULL),(100,40,'shortlist','≡ƒÄë You have been Shortlisted!','You have been shortlisted by Amazon India. Please check your dashboard for further updates.',0,NULL,NULL,'2026-08-16 10:55:56',NULL),(101,38,'shortlist','≡ƒÄë You have been Shortlisted!','You have been shortlisted by Amazon India. Please check your dashboard for further updates.',0,NULL,NULL,'2026-08-16 10:55:56',NULL),(102,37,'shortlist','≡ƒÄë You have been Shortlisted!','You have been shortlisted by Amazon India. Please check your dashboard for further updates.',0,NULL,NULL,'2026-08-16 10:55:56',NULL),(103,41,'shortlist','≡ƒÄë You have been Shortlisted!','You have been shortlisted by Amazon India. Please check your dashboard for further updates.',0,NULL,NULL,'2026-08-16 11:08:19',NULL),(104,54,'shortlist','≡ƒÄë You have been Shortlisted!','You have been shortlisted by Amazon India. Please check your dashboard for further updates.',0,NULL,NULL,'2026-08-16 11:21:27',NULL),(105,55,'shortlist','≡ƒÄë You have been Shortlisted!','You have been shortlisted by Amazon India. Please check your dashboard for further updates.',0,NULL,NULL,'2026-08-16 11:21:31',NULL),(106,36,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-20 at 16:55. Join here: https://meet.google.com/hdrjmsqdkt',0,NULL,NULL,'2026-08-16 11:25:23',NULL),(107,37,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-27 at 16:55. Join here: https://meet.google.com/xeoxoqbyfj',0,NULL,NULL,'2026-08-16 11:25:32',NULL),(108,40,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-28 at 16:55. Join here: https://meet.google.com/wcjqitecgi',0,NULL,NULL,'2026-08-16 11:25:40',NULL),(109,2,'application','Application Submitted','You have successfully applied for Full Stack Developer',1,NULL,NULL,'2026-08-16 11:49:07',NULL),(110,2,'interview','Interview Scheduled','Your interview has been scheduled on 2026-08-27 at 20:27. Join here: https://meet.google.com/mbjasbbmec',1,NULL,NULL,'2026-08-16 14:57:45',NULL),(111,2,'offer','≡ƒÄë Congratulations! You have an Offer Letter!','You have been selected by Amazon India for the position of Full Stack Developer with package 24 LPA. Please check your dashboard for the offer letter.',1,NULL,NULL,'2026-08-16 14:58:10',NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `application_id` int NOT NULL,
  `company_id` int NOT NULL,
  `job_id` int NOT NULL,
  `offer_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `package_offered` varchar(50) DEFAULT NULL,
  `status` enum('pending','accepted','declined') DEFAULT 'pending',
  `joining_date` date DEFAULT NULL,
  `description` text,
  `base_salary` varchar(50) DEFAULT NULL,
  `bonus` varchar(50) DEFAULT NULL,
  `stocks` varchar(50) DEFAULT NULL,
  `joining_bonus` varchar(50) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `perks` text,
  `recruiter` varchar(100) DEFAULT NULL,
  `recruiter_email` varchar(100) DEFAULT NULL,
  `probation_period` varchar(50) DEFAULT NULL,
  `notice_period` varchar(50) DEFAULT NULL,
  `team_size` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `application_id` (`application_id`),
  KEY `company_id` (`company_id`),
  KEY `job_id` (`job_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `offers_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `offers_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `offers_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `offers_ibfk_4` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offers`
--

LOCK TABLES `offers` WRITE;
/*!40000 ALTER TABLE `offers` DISABLE KEYS */;
INSERT INTO `offers` VALUES (3,2,96,4,28,'2026-08-16 17:00:03','12 LPA','accepted','2026-09-15','Congratulations! You have been selected for the position. Welcome to Amazon India!','12 LPA','2 LPA','1 LPA','1 LPA','Bangalore, India','Health Insurance, Paid Time Off, Remote Work Options, Learning Budget','HR Team','hr@amazon.com','3 months','1 month','10-15','2026-08-16 11:30:03','2026-08-16 11:39:04'),(4,2,113,4,29,'2026-08-16 17:00:03','15 LPA','accepted','2026-09-15','Congratulations! You have been selected for the position. Welcome to Amazon India!','15 LPA','3 LPA','2 LPA','1.5 LPA','Bangalore, India','Health Insurance, Paid Time Off, Remote Work Options, Learning Budget, Stock Options','HR Team','hr@amazon.com','3 months','1 month','15-20','2026-08-16 11:30:03','2026-08-16 11:39:04'),(5,2,114,4,27,'2026-08-16 20:28:10','24 LPA','accepted','2026-09-15','Congratulations! You have been selected for the position of Full Stack Developer at Amazon India.','24 LPA','N/A','N/A','N/A','Noida','Health Insurance, Paid Time Off, Remote Work Options','Amazon India','hr@company.com','3 months','1 month','10-15','2026-08-16 14:58:10','2026-08-16 14:59:04');
/*!40000 ALTER TABLE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_contact` (`email`,`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
INSERT INTO `password_resets` VALUES (1,'230101120045@centurionuniv.edu.in',NULL,'598244','2026-07-30 23:38:16','2026-07-30 17:58:15'),(3,'230101120045@centurionuniv.edu.in',NULL,'545426','2026-07-30 23:48:15','2026-07-30 18:08:14'),(4,'230101120045@centurionuniv.edu.in',NULL,'667780','2026-07-30 23:49:46','2026-07-30 18:09:45'),(6,'aahamsonu@gmail.com',NULL,'313407','2026-07-31 01:51:39','2026-07-30 20:11:38'),(7,'230101120045@centurionuniv.edu.in',NULL,'664151','2026-07-31 12:48:07','2026-07-31 07:08:07'),(8,'230101120045@centurionuniv.edu.in',NULL,'598332','2026-07-31 12:51:21','2026-07-31 07:11:20'),(9,'230101120045@centurionuniv.edu.in',NULL,'976505','2026-07-31 13:57:18','2026-07-31 08:17:17');
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `placement_drives`
--

DROP TABLE IF EXISTS `placement_drives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `placement_drives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `companies` text COLLATE utf8mb4_unicode_ci,
  `eligible_branches` text COLLATE utf8mb4_unicode_ci,
  `min_cgpa` decimal(3,2) DEFAULT '0.00',
  `package_range` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('upcoming','ongoing','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'upcoming',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `total_applied` int DEFAULT '0',
  `shortlisted` int DEFAULT '0',
  `selected` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `placement_drives`
--

LOCK TABLES `placement_drives` WRITE;
/*!40000 ALTER TABLE `placement_drives` DISABLE KEYS */;
INSERT INTO `placement_drives` VALUES (4,'Google Hiring Challenge','Google is hiring fresh graduates for Software Engineering roles.','2026-08-05','2026-08-07','Google India','CSE, IT',8.00,'20-40 LPA','completed','2026-07-31 15:38:38','2026-08-12 17:07:09',45,12,5),(5,'TCS Campus Drive 2026','TCS is conducting campus recruitment for multiple positions.','2026-07-26','2026-07-28','TCS','All Branches',6.00,'3-6 LPA','completed','2026-07-31 15:38:38','2026-08-02 13:42:34',120,45,18),(7,'Google Hiring Challenge','Google hiring challenge for top talent','2026-08-01','2026-08-08','Google India','CSE,IT,ECE',8.00,'20-40 LPA','completed','2026-08-01 08:31:28','2026-08-12 17:07:09',60,20,8),(8,'TCS Campus Drive 2026','TCS campus recruitment drive','2026-07-25','2026-07-27','TCS','All Branches',6.00,'3-6 LPA','completed','2026-08-01 08:31:28','2026-08-02 13:50:16',85,30,12),(9,'Microsoft Campus Drive','Microsoft campus recruitment','2026-08-14','2026-08-16','Microsoft','CSE,IT',8.50,'25-50 LPA','ongoing','2026-08-01 08:31:28','2026-08-16 11:55:21',50,15,5),(10,'Asus Campus Drive','Asus Hp hiring challenge for top talent','2026-07-31','2026-08-01','Asus india, Hp india, Amazon india','CSE, IT, ECE, EEE',8.00,'20 LPA','completed','2026-08-02 13:56:38','2026-08-02 14:07:42',0,0,0),(12,'campus drive','welcome','2026-08-04','2026-08-08','Amzon india','CSE',7.00,'23 LPA','completed','2026-08-02 14:15:03','2026-08-12 17:07:09',0,0,0);
/*!40000 ALTER TABLE `placement_drives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(50) DEFAULT 'general',
  `type` varchar(50) DEFAULT 'PDF',
  `icon` varchar(50) DEFAULT '?',
  `file_url` varchar(500) DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `size` varchar(20) DEFAULT NULL,
  `pages` int DEFAULT '0',
  `rating` decimal(2,1) DEFAULT '0.0',
  `downloads` int DEFAULT '0',
  `author` varchar(100) DEFAULT NULL,
  `batch` varchar(20) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `package` varchar(50) DEFAULT NULL,
  `topics` text,
  `status` varchar(20) DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES (1,'Aptitude Preparation Guide','Comprehensive guide covering all aptitude topics for placement exams. Includes quantitative aptitude, logical reasoning, and verbal ability.','aptitude','PDF','?','/uploads/resources/aptitude-guide.pdf',NULL,'2.5 MB',120,4.5,1500,'Prof. Rajesh Kumar',NULL,NULL,NULL,'Quantitative Aptitude, Logical Reasoning, Verbal Ability, Data Interpretation','active','2026-08-12 14:37:29','2026-08-12 14:37:29'),(2,'Top 100 Interview Questions','Most frequently asked interview questions in top product-based companies. Includes detailed answers and explanations.','interview','PDF','?','/uploads/resources/interview-questions.pdf',NULL,'1.8 MB',85,4.8,2300,'Ananya Sharma',NULL,NULL,NULL,'HR Interview, Technical Interview, Problem Solving, System Design','active','2026-08-12 14:37:29','2026-08-12 14:37:29'),(3,'Coding Interview Preparation','Complete guide to crack coding interviews. Includes data structures, algorithms, and competitive programming tips.','coding','PDF','?','/uploads/resources/coding-prep.pdf',NULL,'3.2 MB',150,4.7,1800,'Vikram Singh',NULL,NULL,NULL,'Data Structures, Algorithms, Dynamic Programming, Graph Theory','active','2026-08-12 14:37:29','2026-08-12 14:37:29'),(4,'Resume Writing Tips','Learn how to create an impressive resume that stands out to recruiters. Includes templates and examples.','resume','PDF','?','/uploads/resources/resume-tips.pdf',NULL,'1.2 MB',45,4.3,900,'Career Services Team',NULL,NULL,NULL,'Resume Formatting, Key Skills, Achievements, Cover Letter','active','2026-08-12 14:37:29','2026-08-12 14:37:29'),(5,'Amazon Interview Experience','Detailed interview experience from a student who got placed at Amazon. Includes all rounds and tips.','experience','Article','?','/uploads/resources/amazon-experience.pdf','https://example.com/amazon-experience',NULL,NULL,4.6,1200,'Rahul Gupta',NULL,NULL,NULL,'Online Assessment, Technical Round 1, Technical Round 2, HR Round','active','2026-08-12 14:37:29','2026-08-12 15:36:25'),(6,'Google Interview Experience','Complete interview experience for Google SDE role. Preparation strategy and tips from a successful candidate.','experience','Article','?','/uploads/resources/google-experience.pdf','https://example.com/google-experience',NULL,NULL,4.9,2100,'Priya Patel',NULL,NULL,NULL,'DSA, System Design, Behavioral, Googleyness','active','2026-08-12 14:37:29','2026-08-12 15:36:25'),(7,'Cloud Certification Guide','Guide to prepare for AWS and Azure certifications. Includes resources, practice tests, and tips.','certification','PDF','??','/uploads/resources/cloud-cert.pdf',NULL,'4.1 MB',200,4.4,750,'Tech Academy',NULL,NULL,NULL,'AWS, Azure, Cloud Computing, DevOps','active','2026-08-12 14:37:29','2026-08-12 14:37:29');
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_jobs`
--

DROP TABLE IF EXISTS `saved_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `job_id` int NOT NULL,
  `saved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_saved_job` (`student_id`,`job_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_job_id` (`job_id`),
  CONSTRAINT `saved_jobs_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_jobs_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_jobs`
--

LOCK TABLES `saved_jobs` WRITE;
/*!40000 ALTER TABLE `saved_jobs` DISABLE KEYS */;
INSERT INTO `saved_jobs` VALUES (16,3,28,'2026-08-14 18:33:55'),(17,3,27,'2026-08-15 09:41:29'),(18,3,29,'2026-08-16 11:49:22');
/*!40000 ALTER TABLE `saved_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_resources`
--

DROP TABLE IF EXISTS `saved_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_resources` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `resource_id` int NOT NULL,
  `saved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_save` (`student_id`,`resource_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_resource_id` (`resource_id`),
  CONSTRAINT `saved_resources_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_resources_ibfk_2` FOREIGN KEY (`resource_id`) REFERENCES `resources` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_resources`
--

LOCK TABLES `saved_resources` WRITE;
/*!40000 ALTER TABLE `saved_resources` DISABLE KEYS */;
INSERT INTO `saved_resources` VALUES (1,2,1,'2026-08-12 14:46:44'),(2,2,3,'2026-08-12 14:46:44'),(5,2,4,'2026-08-16 14:59:08');
/*!40000 ALTER TABLE `saved_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shortlisted_students`
--

DROP TABLE IF EXISTS `shortlisted_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shortlisted_students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `company_id` int NOT NULL,
  `status` varchar(50) DEFAULT 'shortlisted',
  `shortlisted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_shortlist` (`student_id`,`company_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `shortlisted_students_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shortlisted_students_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shortlisted_students`
--

LOCK TABLES `shortlisted_students` WRITE;
/*!40000 ALTER TABLE `shortlisted_students` DISABLE KEYS */;
INSERT INTO `shortlisted_students` VALUES (1,2,4,'shortlisted','2026-08-16 16:10:42','2026-08-16 16:10:42','2026-08-16 16:10:42'),(2,42,4,'shortlisted','2026-08-16 16:19:22','2026-08-16 16:19:22','2026-08-16 16:19:22'),(3,36,4,'shortlisted','2026-08-16 16:25:08','2026-08-16 16:25:08','2026-08-16 16:25:08'),(4,40,4,'shortlisted','2026-08-16 16:25:56','2026-08-16 16:25:56','2026-08-16 16:25:56'),(5,38,4,'shortlisted','2026-08-16 16:25:56','2026-08-16 16:25:56','2026-08-16 16:25:56'),(6,37,4,'shortlisted','2026-08-16 16:25:56','2026-08-16 16:25:56','2026-08-16 16:25:56'),(7,41,4,'shortlisted','2026-08-16 16:38:19','2026-08-16 16:38:19','2026-08-16 16:38:19'),(8,54,4,'shortlisted','2026-08-16 16:51:27','2026-08-16 16:51:27','2026-08-16 16:51:27'),(9,55,4,'shortlisted','2026-08-16 16:51:31','2026-08-16 16:51:31','2026-08-16 16:51:31');
/*!40000 ALTER TABLE `shortlisted_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `reg_no` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `program` varchar(100) DEFAULT NULL,
  `branch` varchar(100) DEFAULT NULL,
  `session` varchar(50) DEFAULT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `current_cgpa` decimal(4,2) DEFAULT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `skills` text,
  `certifications` text,
  `projects` text,
  `languages` text,
  `linkedin` varchar(255) DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `portfolio` varchar(255) DEFAULT NULL,
  `bio` text,
  `address` text,
  `dob` date DEFAULT NULL,
  `backlogs` int DEFAULT '0',
  `year_gap` int DEFAULT '0',
  `experience_years` decimal(3,1) DEFAULT '0.0',
  `resume_url` varchar(500) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `achievements` text,
  `experience` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `student_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
INSERT INTO `student_profiles` VALUES (3,2,'230101120045','+91 7761853789','B.Tech','CSE','2023-2027','7th',9.00,'/uploads/profile-pics/profile_2_1786816682948.png','React, Java, Python, MySQL, Node.js, HTML, CSS, JavaScript','AWS Certified,Google Cloud','E-commerce Website,Chat Application','English,Hindi,Odia','https://linkedin.com/in/aaham','https://github.com/aaham','https://aaham.dev','Passionate software developer with interest in full-stack development.','Bhubaneswar, Odisha','2005-01-14',0,0,0.0,'/uploads/resumes/resume_2_1786812256493.pdf',NULL,NULL,NULL),(25,36,'230101120001','9876543210','B.Tech','CSE','2023-27','6th',8.50,NULL,'React, Python, Java, MySQL, Node.js, HTML, CSS, JavaScript, Django, SQL',NULL,NULL,NULL,'https://linkedin.com/in/priya','https://github.com/priya',NULL,NULL,NULL,NULL,0,0,0.0,'resume_priya.pdf',NULL,NULL,NULL),(26,37,'230101120002','9876543211','B.Tech','IT','2023-27','6th',7.80,NULL,'Java, MySQL, React, Python, Node.js, HTML, CSS, Spring Boot, Hibernate, AWS',NULL,NULL,NULL,'https://linkedin.com/in/raj','https://github.com/raj',NULL,NULL,NULL,NULL,0,0,1.5,'resume_raj.pdf',NULL,NULL,NULL),(27,38,'230101120003','9876543212','B.Tech','ECE','2023-27','6th',8.20,NULL,'C++, Python, Arduino, Embedded Systems, React, Java',NULL,NULL,NULL,'https://linkedin.com/in/sneha','https://github.com/sneha',NULL,NULL,NULL,NULL,1,0,0.0,'resume_sneha.pdf',NULL,NULL,NULL),(28,39,'230101120004','9876543213','B.Tech','MECH','2023-27','6th',6.50,NULL,'AutoCAD, SolidWorks, MATLAB, Python, Java',NULL,NULL,NULL,'https://linkedin.com/in/amit','https://github.com/amit',NULL,NULL,NULL,NULL,0,0,2.0,'resume_amit.pdf',NULL,NULL,NULL),(29,40,'230101120005','9876543214','B.Tech','CSE','2023-27','6th',9.20,NULL,'React, Node.js, JavaScript, Python, Java, MySQL, HTML, CSS, React Native, MongoDB, Firebase',NULL,NULL,NULL,'https://linkedin.com/in/neha','https://github.com/neha',NULL,NULL,NULL,NULL,0,0,0.0,'resume_neha.pdf',NULL,NULL,NULL),(30,41,'230101120006','9876543215','B.Tech','IT','2023-27','6th',7.20,NULL,'Java, Python, SQL, HTML, CSS, React, MySQL',NULL,NULL,NULL,'https://linkedin.com/in/vikram','https://github.com/vikram',NULL,NULL,NULL,NULL,2,0,0.0,'resume_vikram.pdf',NULL,NULL,NULL),(31,42,'230101120007','9876543216','B.Tech','CSE','2023-27','6th',8.80,NULL,'React, Angular, TypeScript, Node.js, GraphQL, Java, Python, MySQL, HTML, CSS',NULL,NULL,NULL,'https://linkedin.com/in/ananya','https://github.com/ananya',NULL,NULL,NULL,NULL,0,1,0.0,'resume_ananya.pdf',NULL,NULL,NULL),(32,43,'230101120008','9876543217','B.Tech','EEE','2023-27','6th',6.20,NULL,'C, Embedded C, Assembly, Python, Java',NULL,NULL,NULL,'https://linkedin.com/in/rohit','https://github.com/rohit',NULL,NULL,NULL,NULL,3,2,0.0,'resume_rohit.pdf',NULL,NULL,NULL),(43,54,'230101120050','9876543211','B.Tech','IT','2023-2027','6th',8.70,NULL,'React,Node.js,JavaScript,Python,MongoDB','AWS Certified, Google Associate','E-commerce Platform, Chat Application','English,Hindi',NULL,NULL,NULL,NULL,NULL,NULL,0,0,0.0,NULL,'Bangalore, Karnataka',NULL,NULL),(44,55,'230101120051','9876543212','B.Tech','CSE','2023-2027','6th',9.10,NULL,'Java,Spring Boot,React,MySQL,Docker,AWS','Oracle Certified, Kubernetes Certified','Microservices Project, Inventory Management System','English,Telugu,Hindi',NULL,NULL,NULL,NULL,NULL,NULL,0,0,1.5,NULL,'Hyderabad, Telangana',NULL,NULL);
/*!40000 ALTER TABLE `student_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_settings`
--

DROP TABLE IF EXISTS `student_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `email_notifications` tinyint(1) DEFAULT '1',
  `push_notifications` tinyint(1) DEFAULT '1',
  `sms_notifications` tinyint(1) DEFAULT '0',
  `job_alerts` tinyint(1) DEFAULT '1',
  `interview_reminders` tinyint(1) DEFAULT '1',
  `offer_updates` tinyint(1) DEFAULT '1',
  `newsletter` tinyint(1) DEFAULT '0',
  `profile_visibility` enum('public','private','company_only') COLLATE utf8mb4_unicode_ci DEFAULT 'public',
  `show_resume` tinyint(1) DEFAULT '1',
  `show_contact` tinyint(1) DEFAULT '1',
  `show_skills` tinyint(1) DEFAULT '1',
  `data_sharing` tinyint(1) DEFAULT '1',
  `theme` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'light',
  `font_size` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `compact_view` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_id` (`student_id`),
  KEY `idx_student_id` (`student_id`),
  CONSTRAINT `student_settings_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_settings`
--

LOCK TABLES `student_settings` WRITE;
/*!40000 ALTER TABLE `student_settings` DISABLE KEYS */;
INSERT INTO `student_settings` VALUES (2,3,1,1,0,1,1,1,0,'public',1,1,1,0,'dark','small',0,'2026-08-12 13:49:51','2026-08-12 14:02:31');
/*!40000 ALTER TABLE `student_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','student','company','pending_company','pending_student') NOT NULL DEFAULT 'student',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'AAHAM KUMR ARYA','230101120045@centurionuniv.edu.in','admin123','student','2026-07-30 17:14:14'),(12,'Admin','aahamsonu1@gmail.com','admin123','admin','2026-07-31 09:20:29'),(15,'Company','aahamsonu@gmail.com','admin123','company','2026-07-31 10:55:02'),(36,'Priya Sharma','priya@student.com','password123','student','2026-08-15 13:53:22'),(37,'Raj Kumar','raj@student.com','password123','student','2026-08-15 13:53:22'),(38,'Sneha Patel','sneha@student.com','password123','student','2026-08-15 13:53:22'),(39,'Amit Verma','amit@student.com','password123','student','2026-08-15 13:53:22'),(40,'Neha Singh','neha@student.com','password123','student','2026-08-15 13:53:22'),(41,'Vikram Reddy','vikram@student.com','password123','student','2026-08-15 13:53:22'),(42,'Ananya Gupta','ananya@student.com','password123','student','2026-08-15 13:53:22'),(43,'Rohit Kumar','rohit@student.com','password123','student','2026-08-15 13:53:22'),(54,'Vikram Singh','vikram.singh@cutm.ac.in','password123','student','2026-08-16 11:19:22'),(55,'Priya Reddy','priya.reddy@cutm.ac.in','password123','student','2026-08-16 11:19:22');
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

-- Dump completed on 2026-08-16 22:51:25
