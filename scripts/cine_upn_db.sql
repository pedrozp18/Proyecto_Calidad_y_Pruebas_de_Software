CREATE DATABASE  IF NOT EXISTS `cine_upn_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cine_upn_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: cine_upn_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `afiliacion`
--

DROP TABLE IF EXISTS `afiliacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `afiliacion` (
  `idAfiliacion` int NOT NULL AUTO_INCREMENT,
  `idCliente` int DEFAULT NULL,
  `fechaRegistro` date NOT NULL,
  `porcentajeDescuento` decimal(5,2) NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`idAfiliacion`),
  KEY `idCliente` (`idCliente`),
  CONSTRAINT `afiliacion_ibfk_1` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `afiliacion`
--

LOCK TABLES `afiliacion` WRITE;
/*!40000 ALTER TABLE `afiliacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `afiliacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asiento`
--

DROP TABLE IF EXISTS `asiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asiento` (
  `idAsiento` int NOT NULL AUTO_INCREMENT,
  `idSala` int DEFAULT NULL,
  `fila` char(1) NOT NULL,
  `columna` int NOT NULL,
  PRIMARY KEY (`idAsiento`),
  KEY `idSala` (`idSala`),
  CONSTRAINT `asiento_ibfk_1` FOREIGN KEY (`idSala`) REFERENCES `sala` (`idSala`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asiento`
--

LOCK TABLES `asiento` WRITE;
/*!40000 ALTER TABLE `asiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `asiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `caja`
--

DROP TABLE IF EXISTS `caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caja` (
  `idSesionCaja` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int DEFAULT NULL,
  `numeroCajaFisica` int NOT NULL,
  `fechaHorarioApertura` datetime NOT NULL,
  `fechaHorarioCierre` datetime DEFAULT NULL,
  `montoApertura` decimal(10,2) NOT NULL,
  `montoCierreSistema` decimal(10,2) DEFAULT NULL,
  `montoCierreReal` decimal(10,2) DEFAULT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`idSesionCaja`),
  KEY `idUsuario` (`idUsuario`),
  CONSTRAINT `caja_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `caja`
--

LOCK TABLES `caja` WRITE;
/*!40000 ALTER TABLE `caja` DISABLE KEYS */;
INSERT INTO `caja` VALUES (1,2,1,'2026-09-23 06:24:51',NULL,150.00,NULL,NULL,'Abierta');
/*!40000 ALTER TABLE `caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `dni` varchar(15) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `correo` (`correo`),
  UNIQUE KEY `unique_dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (4,'Leon Davila','DSFSDFS@UPN.PE','$2b$10$tpXdPlRrUVbg4j26CD5DBOKr/vwUkDH6XlPyXpuj5WdZKa266H9wi','65165165','2026-09-23 21:07:03'),(5,'aramburu Lazo Claudio','a@q','$2b$10$3gQwQma6bwjCZDjvbD99kuIL4pzV.fotCzujC6L93CVnnlrhIzHB.','12345678','2026-09-23 21:41:37');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `control_reserva_temporal`
--

DROP TABLE IF EXISTS `control_reserva_temporal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `control_reserva_temporal` (
  `idFuncion` int NOT NULL,
  `idAsiento` int NOT NULL,
  `estado` enum('Disponible','Reservado_Temporal','Ocupado') DEFAULT 'Disponible',
  `fecha_reserva` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idFuncion`,`idAsiento`),
  KEY `idAsiento` (`idAsiento`),
  CONSTRAINT `control_reserva_temporal_ibfk_1` FOREIGN KEY (`idFuncion`) REFERENCES `funcion` (`idFuncion`),
  CONSTRAINT `control_reserva_temporal_ibfk_2` FOREIGN KEY (`idAsiento`) REFERENCES `asiento` (`idAsiento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `control_reserva_temporal`
--

LOCK TABLES `control_reserva_temporal` WRITE;
/*!40000 ALTER TABLE `control_reserva_temporal` DISABLE KEYS */;
/*!40000 ALTER TABLE `control_reserva_temporal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuadre_de_caja`
--

DROP TABLE IF EXISTS `cuadre_de_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuadre_de_caja` (
  `idCuadre` int NOT NULL AUTO_INCREMENT,
  `idSesionCaja` int DEFAULT NULL,
  `diferencia` decimal(10,2) NOT NULL,
  `observaciones` text,
  PRIMARY KEY (`idCuadre`),
  UNIQUE KEY `idSesionCaja` (`idSesionCaja`),
  CONSTRAINT `cuadre_de_caja_ibfk_1` FOREIGN KEY (`idSesionCaja`) REFERENCES `caja` (`idSesionCaja`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuadre_de_caja`
--

LOCK TABLES `cuadre_de_caja` WRITE;
/*!40000 ALTER TABLE `cuadre_de_caja` DISABLE KEYS */;
/*!40000 ALTER TABLE `cuadre_de_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_ingreso`
--

DROP TABLE IF EXISTS `detalle_ingreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_ingreso` (
  `idNotaIngreso` int NOT NULL,
  `idInsumo` int NOT NULL,
  `cantidadRecibida` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idNotaIngreso`,`idInsumo`),
  KEY `idInsumo` (`idInsumo`),
  CONSTRAINT `detalle_ingreso_ibfk_1` FOREIGN KEY (`idNotaIngreso`) REFERENCES `ingreso` (`idNotaIngreso`),
  CONSTRAINT `detalle_ingreso_ibfk_2` FOREIGN KEY (`idInsumo`) REFERENCES `insumo` (`idInsumo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ingreso`
--

LOCK TABLES `detalle_ingreso` WRITE;
/*!40000 ALTER TABLE `detalle_ingreso` DISABLE KEYS */;
INSERT INTO `detalle_ingreso` VALUES (1,1,13.00),(1,2,15.00),(1,3,10.00);
/*!40000 ALTER TABLE `detalle_ingreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_orden`
--

DROP TABLE IF EXISTS `detalle_orden`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_orden` (
  `idOrdenCompra` int NOT NULL,
  `idInsumo` int NOT NULL,
  `cantidadRequerida` int NOT NULL,
  `precioCompra` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idOrdenCompra`,`idInsumo`),
  KEY `idInsumo` (`idInsumo`),
  CONSTRAINT `detalle_orden_ibfk_1` FOREIGN KEY (`idOrdenCompra`) REFERENCES `orden` (`idOrdenCompra`),
  CONSTRAINT `detalle_orden_ibfk_2` FOREIGN KEY (`idInsumo`) REFERENCES `insumo` (`idInsumo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_orden`
--

LOCK TABLES `detalle_orden` WRITE;
/*!40000 ALTER TABLE `detalle_orden` DISABLE KEYS */;
INSERT INTO `detalle_orden` VALUES (1,1,13,45.00),(1,2,15,25.50),(1,3,10,30.00);
/*!40000 ALTER TABLE `detalle_orden` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_venta`
--

DROP TABLE IF EXISTS `detalle_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_venta` (
  `idComprobante` int NOT NULL AUTO_INCREMENT,
  `idVenta` int DEFAULT NULL,
  `idFuncion` int DEFAULT NULL,
  `idAsiento` int DEFAULT NULL,
  `idProducto` int DEFAULT NULL,
  `item_comprado` varchar(150) NOT NULL,
  `montoPagado` decimal(10,2) NOT NULL,
  `vuelto` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`idComprobante`),
  KEY `idVenta` (`idVenta`),
  KEY `idFuncion` (`idFuncion`),
  KEY `idAsiento` (`idAsiento`),
  KEY `idProducto` (`idProducto`),
  CONSTRAINT `detalle_venta_ibfk_1` FOREIGN KEY (`idVenta`) REFERENCES `venta` (`idVenta`),
  CONSTRAINT `detalle_venta_ibfk_2` FOREIGN KEY (`idFuncion`) REFERENCES `funcion` (`idFuncion`),
  CONSTRAINT `detalle_venta_ibfk_3` FOREIGN KEY (`idAsiento`) REFERENCES `asiento` (`idAsiento`),
  CONSTRAINT `detalle_venta_ibfk_4` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_venta`
--

LOCK TABLES `detalle_venta` WRITE;
/*!40000 ALTER TABLE `detalle_venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_venta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funcion`
--

DROP TABLE IF EXISTS `funcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcion` (
  `idFuncion` int NOT NULL AUTO_INCREMENT,
  `idPelicula` int DEFAULT NULL,
  `idSala` int DEFAULT NULL,
  `fecha` date NOT NULL,
  `horarioInicio` varchar(10) NOT NULL,
  `horarioFin` varchar(10) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `precioBase` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idFuncion`),
  KEY `idPelicula` (`idPelicula`),
  KEY `idSala` (`idSala`),
  CONSTRAINT `funcion_ibfk_1` FOREIGN KEY (`idPelicula`) REFERENCES `pelicula` (`idPelicula`),
  CONSTRAINT `funcion_ibfk_2` FOREIGN KEY (`idSala`) REFERENCES `sala` (`idSala`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcion`
--

LOCK TABLES `funcion` WRITE;
/*!40000 ALTER TABLE `funcion` DISABLE KEYS */;
INSERT INTO `funcion` VALUES (1,1,1,'2026-09-15','04:25','00:00','Disponible',18.00);
/*!40000 ALTER TABLE `funcion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingreso`
--

DROP TABLE IF EXISTS `ingreso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingreso` (
  `idNotaIngreso` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int DEFAULT NULL,
  `fechaRegistro` date NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`idNotaIngreso`),
  KEY `idUsuario` (`idUsuario`),
  CONSTRAINT `ingreso_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingreso`
--

LOCK TABLES `ingreso` WRITE;
/*!40000 ALTER TABLE `ingreso` DISABLE KEYS */;
INSERT INTO `ingreso` VALUES (1,3,'2026-09-23','Completado');
/*!40000 ALTER TABLE `ingreso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insumo`
--

DROP TABLE IF EXISTS `insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insumo` (
  `idInsumo` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `stockActual` int NOT NULL,
  `stockMinimo` int NOT NULL,
  `precioSugerido` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idInsumo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insumo`
--

LOCK TABLES `insumo` WRITE;
/*!40000 ALTER TABLE `insumo` DISABLE KEYS */;
INSERT INTO `insumo` VALUES (1,'Maíz Popcorn Premium (Saco 25kg)',15,5,45.00),(2,'Vasos de Cartón para Gaseosa 32oz',25,20,25.50),(3,'Cajas de Cartón Popcorn Mediano',160,50,30.00);
/*!40000 ALTER TABLE `insumo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_de_caja`
--

DROP TABLE IF EXISTS `movimiento_de_caja`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_de_caja` (
  `idMovimiento` int NOT NULL AUTO_INCREMENT,
  `idSesionCaja` int DEFAULT NULL,
  `idVenta` int DEFAULT NULL,
  `tipoMovimiento` varchar(50) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `hora` varchar(10) NOT NULL,
  PRIMARY KEY (`idMovimiento`),
  KEY `idSesionCaja` (`idSesionCaja`),
  KEY `idVenta` (`idVenta`),
  CONSTRAINT `movimiento_de_caja_ibfk_1` FOREIGN KEY (`idSesionCaja`) REFERENCES `caja` (`idSesionCaja`),
  CONSTRAINT `movimiento_de_caja_ibfk_2` FOREIGN KEY (`idVenta`) REFERENCES `venta` (`idVenta`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_de_caja`
--

LOCK TABLES `movimiento_de_caja` WRITE;
/*!40000 ALTER TABLE `movimiento_de_caja` DISABLE KEYS */;
INSERT INTO `movimiento_de_caja` VALUES (1,1,NULL,'SALDO INICIAL APERTURA',150.00,'01:24:51');
/*!40000 ALTER TABLE `movimiento_de_caja` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orden`
--

DROP TABLE IF EXISTS `orden`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orden` (
  `idOrdenCompra` int NOT NULL AUTO_INCREMENT,
  `idProveedor` int DEFAULT NULL,
  `idUsuario` int DEFAULT NULL,
  `fechaRegistro` date NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`idOrdenCompra`),
  KEY `idProveedor` (`idProveedor`),
  KEY `idUsuario` (`idUsuario`),
  CONSTRAINT `orden_ibfk_1` FOREIGN KEY (`idProveedor`) REFERENCES `proveedor` (`idProveedor`),
  CONSTRAINT `orden_ibfk_2` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orden`
--

LOCK TABLES `orden` WRITE;
/*!40000 ALTER TABLE `orden` DISABLE KEYS */;
INSERT INTO `orden` VALUES (1,1,3,'2026-09-23','Recibido');
/*!40000 ALTER TABLE `orden` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pelicula`
--

DROP TABLE IF EXISTS `pelicula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pelicula` (
  `idPelicula` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) NOT NULL,
  `duracion` int NOT NULL,
  `genero` varchar(50) NOT NULL,
  `sipnosis` text,
  `imagenPoster` longblob,
  PRIMARY KEY (`idPelicula`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pelicula`
--

LOCK TABLES `pelicula` WRITE;
/*!40000 ALTER TABLE `pelicula` DISABLE KEYS */;
INSERT INTO `pelicula` VALUES (1,'Avengers: Endgame',181,'Acción','Los héroes sobrevivientes buscan revertir el daño...',NULL),(2,'Interestelar',169,'Ciencia Ficción','Un equipo de exploradores viaja a través de un agujero de gusano...',NULL);
/*!40000 ALTER TABLE `pelicula` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `idProducto` int NOT NULL AUTO_INCREMENT,
  `nombreProducto` varchar(100) NOT NULL,
  `categoria` enum('Combo','Bebida','Snack','Otro') NOT NULL,
  `precioVenta` decimal(10,2) NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`idProducto`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'Combo Personal','Combo',18.50,'Activo'),(2,'Combo Pareja','Combo',32.00,'Activo'),(3,'Gaseosa Grande','Bebida',8.50,'Activo'),(4,'Canchita Mediana','Snack',9.00,'Activo');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedor`
--

DROP TABLE IF EXISTS `proveedor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedor` (
  `idProveedor` int NOT NULL AUTO_INCREMENT,
  `ruc` varchar(11) NOT NULL,
  `razonSocial` varchar(150) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`idProveedor`),
  UNIQUE KEY `ruc` (`ruc`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedor`
--

LOCK TABLES `proveedor` WRITE;
/*!40000 ALTER TABLE `proveedor` DISABLE KEYS */;
INSERT INTO `proveedor` VALUES (1,'20554123981','Distribuidora Corn del Perú S.A.','Av. Industrial 455, Lima','Activo'),(2,'20112233445','MegaPlásticos Pack S.A.C.','Jr. Carabaya 920, Lima','Activo');
/*!40000 ALTER TABLE `proveedor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receta_producto_insumo`
--

DROP TABLE IF EXISTS `receta_producto_insumo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receta_producto_insumo` (
  `idInsumo` int NOT NULL,
  `idProducto` int NOT NULL,
  `cantidad_a_descontar` int NOT NULL,
  PRIMARY KEY (`idInsumo`,`idProducto`),
  KEY `idProducto` (`idProducto`),
  CONSTRAINT `receta_producto_insumo_ibfk_1` FOREIGN KEY (`idInsumo`) REFERENCES `insumo` (`idInsumo`),
  CONSTRAINT `receta_producto_insumo_ibfk_2` FOREIGN KEY (`idProducto`) REFERENCES `producto` (`idProducto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receta_producto_insumo`
--

LOCK TABLES `receta_producto_insumo` WRITE;
/*!40000 ALTER TABLE `receta_producto_insumo` DISABLE KEYS */;
INSERT INTO `receta_producto_insumo` VALUES (2,1,1),(2,3,1),(3,1,1);
/*!40000 ALTER TABLE `receta_producto_insumo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `idRol` int NOT NULL AUTO_INCREMENT,
  `nombreRol` varchar(50) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`idRol`),
  UNIQUE KEY `nombreRol` (`nombreRol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Administrador','Acceso total a la configuración y gestión del sistema',1),(2,'Cajero','Acceso a venta presencial, aperturas y cierres de caja',1),(3,'Encargado_Almacen','Acceso al inventario e ingreso de productos',1);
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sala`
--

DROP TABLE IF EXISTS `sala`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sala` (
  `idSala` int NOT NULL AUTO_INCREMENT,
  `capacidad` int NOT NULL,
  `tipoSala` varchar(50) NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`idSala`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sala`
--

LOCK TABLES `sala` WRITE;
/*!40000 ALTER TABLE `sala` DISABLE KEYS */;
INSERT INTO `sala` VALUES (1,100,'Tradicional','Disponible'),(2,50,'Prime 3D','Disponible'),(3,80,'Atmos Max','Disponible');
/*!40000 ALTER TABLE `sala` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `idUsuario` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `contrasenia` varchar(255) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `idRol` int NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`idUsuario`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_usuario_rol` (`idRol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`idRol`) REFERENCES `rol` (`idRol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (2,'cajero','1234','Pedro Emmanuel','Zapata',2,1),(3,'almacenero','1234','Pedro','Zapata',3,1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venta`
--

DROP TABLE IF EXISTS `venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venta` (
  `idVenta` int NOT NULL AUTO_INCREMENT,
  `idCliente` int DEFAULT NULL,
  `fechaHora` datetime NOT NULL,
  `cantidadBoletos` int DEFAULT '0',
  `montoBruto` decimal(10,2) NOT NULL,
  `montoDescuento` decimal(10,2) DEFAULT '0.00',
  `montoTotalNeto` decimal(10,2) NOT NULL,
  `tipoVenta` enum('Online','Taquilla','Confiteria') NOT NULL,
  `estado` varchar(20) NOT NULL,
  PRIMARY KEY (`idVenta`),
  KEY `idCliente` (`idCliente`),
  CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`idCliente`) REFERENCES `cliente` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venta`
--

LOCK TABLES `venta` WRITE;
/*!40000 ALTER TABLE `venta` DISABLE KEYS */;
/*!40000 ALTER TABLE `venta` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-02 15:02:54
