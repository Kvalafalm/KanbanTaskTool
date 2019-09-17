-- MySQL dump 10.13  Distrib 8.0.12, for Win64 (x86_64)
--
-- Host: localhost    Database: kanbantool
-- ------------------------------------------------------
-- Server version	8.0.12

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bloker`
--

DROP TABLE IF EXISTS `bloker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `bloker` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idtask` int(11) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `startdate` datetime DEFAULT NULL,
  `enddate` datetime DEFAULT NULL,
  `diside` varchar(500) DEFAULT NULL,
  `finished` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bloker`
--

LOCK TABLES `bloker` WRITE;
/*!40000 ALTER TABLE `bloker` DISABLE KEYS */;
INSERT INTO `bloker` VALUES (1,356,'Самусев в отпуске','2019-08-01 00:00:00','2019-08-20 00:00:00','Дождались как не вернется из отпуска',1),(2,356,'Ждем поставщика','2019-09-01 00:00:00',NULL,NULL,0);
/*!40000 ALTER TABLE `bloker` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `desk`
--

DROP TABLE IF EXISTS `desk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `desk` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  `projectsB24` varchar(45) DEFAULT NULL,
  `innerhtml` mediumtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `desk`
--

LOCK TABLES `desk` WRITE;
/*!40000 ALTER TABLE `desk` DISABLE KEYS */;
INSERT INTO `desk` VALUES (1,'ОИО','Доска подразделения ОИО','131;125;117;111;109','    <div class=\"KanbanDesk\" style=\"grid-template-columns: 1fr 6fr 1fr 1fr 1fr 1fr;     width: 2750px;\">');
/*!40000 ALTER TABLE `desk` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `responsibleusersbytask`
--

DROP TABLE IF EXISTS `responsibleusersbytask`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `responsibleusersbytask` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `idtask` int(11) NOT NULL,
  `iduser` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `responsibleusersbytask`
--

LOCK TABLES `responsibleusersbytask` WRITE;
/*!40000 ALTER TABLE `responsibleusersbytask` DISABLE KEYS */;
/*!40000 ALTER TABLE `responsibleusersbytask` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stage`
--

DROP TABLE IF EXISTS `stage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `stage` (
  `idstage` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`idstage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stage`
--

LOCK TABLES `stage` WRITE;
/*!40000 ALTER TABLE `stage` DISABLE KEYS */;
INSERT INTO `stage` VALUES (1,'Бэклог','Все сгенеренныеЗадачи',1),(2,'В работу','Задачи которые взяли в работу',2),(3,'Анализ',NULL,3),(4,'Разработка',NULL,4),(5,'Тестирование',NULL,5),(6,'Ждет обновления',NULL,6),(7,'Готово',NULL,7);
/*!40000 ALTER TABLE `stage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stagehistory`
--

DROP TABLE IF EXISTS `stagehistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `stagehistory` (
  `idtask` int(11) NOT NULL,
  `idstage` int(11) DEFAULT NULL,
  `start` datetime DEFAULT NULL,
  `end` datetime DEFAULT NULL,
  `durationinmin` varchar(45) DEFAULT NULL,
  `finised` tinyint(4) DEFAULT '0',
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`,`idtask`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stagehistory`
--

LOCK TABLES `stagehistory` WRITE;
/*!40000 ALTER TABLE `stagehistory` DISABLE KEYS */;
INSERT INTO `stagehistory` VALUES (379,13,'2019-09-10 15:31:22','2019-09-10 22:31:49','0',1,46),(380,13,'2019-09-10 15:31:28','2019-09-10 22:31:44','0',1,47),(381,13,'2019-09-10 15:31:30','2019-09-10 22:31:43','0',1,48),(381,6,'2019-09-10 15:31:43','2019-09-11 20:01:29','0',1,49),(380,7,'2019-09-10 15:31:45','2019-09-10 22:47:23','0',1,50),(379,14,'2019-09-10 15:31:49','2019-09-13 07:10:04','0',1,51),(380,7,'2019-09-10 15:47:23','2019-09-11 20:01:36','0',1,52),(355,3,'2019-09-11 12:47:11','2019-09-11 19:47:11','0',1,53),(355,2,'2019-09-11 12:47:11',NULL,'0',0,54),(356,8,'2019-09-11 12:48:07','2019-09-16 16:34:07','0',1,55),(381,6,'2019-09-11 13:01:30','2019-09-12 13:10:07','0',1,56),(380,8,'2019-09-11 13:01:37','2019-09-12 12:59:49','0',1,57),(380,14,'2019-09-12 05:59:49','2019-09-13 10:17:46','0',1,58),(381,7,'2019-09-12 06:10:08','2019-09-13 14:12:54','0',1,59),(379,15,'2019-09-13 00:10:04','2019-09-13 10:17:49','0',1,60),(380,15,'2019-09-13 03:17:46',NULL,'0',0,61),(379,15,'2019-09-13 03:17:49',NULL,'0',0,62),(381,8,'2019-09-13 07:12:54','2019-09-16 13:07:28','0',1,63),(381,8,'2019-09-16 06:07:28',NULL,'0',0,68),(356,9,'2019-09-16 09:34:08',NULL,'0',0,69),(354,10,'2019-09-17 02:13:54','2019-09-17 09:13:56','0',1,87),(354,13,'2019-09-17 02:13:56',NULL,'0',0,88);
/*!40000 ALTER TABLE `stagehistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `tasks` (
  `idtasks` int(11) NOT NULL AUTO_INCREMENT,
  `idbitrix24` int(11) DEFAULT NULL,
  `stageid` int(11) DEFAULT NULL,
  `desk` int(11) NOT NULL,
  PRIMARY KEY (`idtasks`),
  UNIQUE KEY `Idtasks_UNIQUE` (`idtasks`)
) ENGINE=InnoDB AUTO_INCREMENT=382 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (289,8379,0,0),(290,8431,0,0),(291,8433,0,0),(292,8439,0,0),(293,8565,0,0),(294,8567,0,0),(295,8569,0,0),(296,8571,0,0),(297,8573,0,0),(298,8575,0,0),(299,8577,0,0),(300,8579,0,0),(301,8581,0,0),(302,8283,0,0),(303,2284,0,0),(304,7931,0,0),(305,7967,0,0),(306,7985,0,0),(307,8463,0,0),(308,8465,0,0),(309,8467,0,0),(310,8469,0,0),(311,8471,0,0),(312,8473,0,0),(313,8475,0,0),(314,8477,0,0),(315,8479,0,0),(316,8481,0,0),(317,8483,0,0),(318,8485,0,0),(319,8487,0,0),(320,8489,0,0),(321,8491,0,0),(322,8493,0,0),(323,8495,0,0),(324,8497,0,0),(325,8499,0,0),(326,8801,0,0),(327,8967,0,0),(328,8971,0,0),(329,966,0,0),(330,4717,0,0),(331,6579,0,0),(332,6907,0,0),(333,7191,0,0),(334,7217,0,0),(335,7375,0,0),(336,7511,0,0),(337,8255,0,0),(338,8259,0,0),(339,8365,0,0),(340,8383,0,0),(341,8393,0,0),(342,8591,0,0),(343,8721,0,0),(344,8757,0,0),(345,8771,0,0),(346,8805,0,0),(347,8835,0,0),(348,8853,0,0),(349,8903,0,0),(350,8933,0,0),(351,8935,0,0),(352,8937,0,0),(353,8939,0,0),(354,8949,13,0),(355,8955,2,0),(356,8981,9,0),(357,8983,6,0),(358,8985,6,0),(359,8987,6,0),(360,8989,6,0),(361,8991,6,0),(362,8993,0,0),(363,9013,6,0),(364,6561,13,0),(365,7489,0,0),(366,8373,0,0),(367,8515,0,0),(368,8549,0,0),(369,8587,0,0),(370,8733,0,0),(371,8767,0,0),(372,8807,0,0),(373,8831,0,0),(374,8861,0,0),(375,8865,0,0),(376,8907,0,0),(377,8923,0,0),(378,9079,11,0),(379,9089,15,0),(380,9091,15,0),(381,9093,8,0);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) DEFAULT NULL,
  `Password` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'N','P'),(2,'slene',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-09-17 15:13:56
