-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.6.4-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for instijobs
CREATE DATABASE IF NOT EXISTS `instijobs` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `instijobs`;

-- Dumping structure for table instijobs.alumne
CREATE TABLE IF NOT EXISTS `alumne` (
  `DNI` varchar(10) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `cognoms` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `any_finalitzacio` int(11) DEFAULT NULL,
  `tutor_id` varchar(10) DEFAULT NULL,
  `telefon` int(11) DEFAULT NULL,
  `poblacio` int(11) DEFAULT NULL,
  PRIMARY KEY (`DNI`),
  KEY `tutor_id` (`tutor_id`),
  KEY `alumne_FK` (`email`),
  KEY `alumne_FK_1` (`poblacio`),
  CONSTRAINT `alumne_FK` FOREIGN KEY (`email`) REFERENCES `login` (`email`),
  CONSTRAINT `alumne_FK_1` FOREIGN KEY (`poblacio`) REFERENCES `poble` (`id`),
  CONSTRAINT `alumne_ibfk_1` FOREIGN KEY (`tutor_id`) REFERENCES `professor` (`DNI`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table instijobs.curs
CREATE TABLE IF NOT EXISTS `curs` (
  `codi` varchar(10) NOT NULL,
  `nom` varchar(254) DEFAULT NULL,
  PRIMARY KEY (`codi`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table instijobs.empresa
CREATE TABLE IF NOT EXISTS `empresa` (
  `NIF` varchar(10) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `adreca` varchar(100) DEFAULT NULL,
  `telefon` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `poblacio` int(11) DEFAULT NULL,
  PRIMARY KEY (`NIF`),
  KEY `email` (`email`),
  KEY `empresa_FK` (`poblacio`),
  CONSTRAINT `empresa_FK` FOREIGN KEY (`poblacio`) REFERENCES `poble` (`id`),
  CONSTRAINT `empresa_ibfk_1` FOREIGN KEY (`email`) REFERENCES `login` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table instijobs.estudis
CREATE TABLE IF NOT EXISTS `estudis` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `alumne_dni` varchar(10) NOT NULL,
  `curs_id` varchar(10) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `estudis_FK` (`alumne_dni`),
  KEY `estudis_FK_1` (`curs_id`),
  CONSTRAINT `estudis_FK` FOREIGN KEY (`alumne_dni`) REFERENCES `alumne` (`DNI`),
  CONSTRAINT `estudis_FK_1` FOREIGN KEY (`curs_id`) REFERENCES `curs` (`codi`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table instijobs.estudis_oferta
CREATE TABLE IF NOT EXISTS `estudis_oferta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `oferta_id` int(11) NOT NULL,
  `curs_id` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `estudis_oferta_FK_1` (`curs_id`),
  KEY `estudis_oferta_FK` (`oferta_id`),
  CONSTRAINT `estudis_oferta_FK` FOREIGN KEY (`oferta_id`) REFERENCES `oferta` (`id`),
  CONSTRAINT `estudis_oferta_FK_1` FOREIGN KEY (`curs_id`) REFERENCES `curs` (`codi`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table instijobs.fct
CREATE TABLE IF NOT EXISTS `fct` (
  `alumne_id` varchar(10) DEFAULT NULL,
  `poble_id` int(11) NOT NULL,
  `descripcio` longtext DEFAULT NULL,
  `acceptat` tinyint(1) DEFAULT 0,
  `nif_empresa` varchar(10) DEFAULT NULL,
  `data_publicacio` date NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teletreball` tinyint(1) DEFAULT 0,
  `curs_id` varchar(10) NOT NULL,
  `titol` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `nif_empresa` (`nif_empresa`),
  KEY `alumne_id` (`alumne_id`),
  KEY `fct_FK` (`poble_id`),
  KEY `fct_FK_1` (`curs_id`),
  CONSTRAINT `fct_FK` FOREIGN KEY (`poble_id`) REFERENCES `poble` (`id`),
  CONSTRAINT `fct_FK_1` FOREIGN KEY (`curs_id`) REFERENCES `curs` (`codi`),
  CONSTRAINT `fct_ibfk_1` FOREIGN KEY (`nif_empresa`) REFERENCES `empresa` (`NIF`),
  CONSTRAINT `fct_ibfk_2` FOREIGN KEY (`alumne_id`) REFERENCES `alumne` (`DNI`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table instijobs.login
CREATE TABLE IF NOT EXISTS `login` (
  `email` varchar(255) NOT NULL,
  `contrasenya` varchar(255) NOT NULL,
  `tipus_usuari` varchar(20) NOT NULL,
  `codi_activacio` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table instijobs.oferta
CREATE TABLE IF NOT EXISTS `oferta` (
  `titol` varchar(255) NOT NULL,
  `descripcio` longtext DEFAULT NULL,
  `teletreball` tinyint(1) DEFAULT NULL,
  `salari` varchar(100) DEFAULT NULL,
  `jornada` varchar(20) DEFAULT NULL,
  `data_publicacio` date DEFAULT NULL,
  `tipus_contracte` varchar(20) DEFAULT NULL,
  `experiencia_minima` varchar(50) DEFAULT NULL,
  `nif_empresa` varchar(10) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `validat` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `nif_empresa` (`nif_empresa`),
  CONSTRAINT `oferta_ibfk_1` FOREIGN KEY (`nif_empresa`) REFERENCES `empresa` (`NIF`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table instijobs.poble
CREATE TABLE IF NOT EXISTS `poble` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table instijobs.professor
CREATE TABLE IF NOT EXISTS `professor` (
  `DNI` varchar(10) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `cognom` varchar(50) DEFAULT NULL,
  `telefon` int(11) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`DNI`),
  KEY `email` (`email`),
  CONSTRAINT `professor_ibfk_1` FOREIGN KEY (`email`) REFERENCES `login` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

-- Dumping structure for table instijobs.sollicitud_oferta
CREATE TABLE IF NOT EXISTS `sollicitud_oferta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `oferta_id` int(11) NOT NULL,
  `alumne_dni` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sollicitud_oferta_FK` (`alumne_dni`),
  KEY `sollicitud_oferta_FK_1` (`oferta_id`),
  CONSTRAINT `sollicitud_oferta_FK` FOREIGN KEY (`alumne_dni`) REFERENCES `alumne` (`DNI`),
  CONSTRAINT `sollicitud_oferta_FK_1` FOREIGN KEY (`oferta_id`) REFERENCES `oferta` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

-- Data exporting was unselected.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
