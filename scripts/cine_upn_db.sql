-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema cine_upn_db
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema cine_upn_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `cine_upn_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `cine_upn_db` ;

-- -----------------------------------------------------
-- Table `cine_upn_db`.`cliente`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`cliente` (
  `id_cliente` INT NOT NULL AUTO_INCREMENT,
  `nombres` VARCHAR(100) NULL DEFAULT NULL,
  `apellidoPaterno` VARCHAR(100) NULL DEFAULT NULL,
  `apellidoMaterno` VARCHAR(100) NULL DEFAULT NULL,
  `correo` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `dni` VARCHAR(15) NULL DEFAULT NULL,
  `fecha_registro` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`),
  UNIQUE INDEX `correo` (`correo` ASC) VISIBLE,
  UNIQUE INDEX `unique_dni` (`dni` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`afiliacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`afiliacion` (
  `idAfiliacion` INT NOT NULL AUTO_INCREMENT,
  `idCliente` INT NULL DEFAULT NULL,
  `fechaRegistro` DATE NOT NULL,
  `porcentajeDescuento` DECIMAL(5,2) NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idAfiliacion`),
  INDEX `idCliente` (`idCliente` ASC) VISIBLE,
  CONSTRAINT `afiliacion_ibfk_1`
    FOREIGN KEY (`idCliente`)
    REFERENCES `cine_upn_db`.`cliente` (`id_cliente`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`sala`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`sala` (
  `idSala` INT NOT NULL AUTO_INCREMENT,
  `capacidad` INT NOT NULL,
  `tipoSala` VARCHAR(50) NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idSala`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`asiento`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`asiento` (
  `idAsiento` INT NOT NULL AUTO_INCREMENT,
  `idSala` INT NULL DEFAULT NULL,
  `fila` CHAR(1) NOT NULL,
  `columna` INT NOT NULL,
  PRIMARY KEY (`idAsiento`),
  INDEX `idSala` (`idSala` ASC) VISIBLE,
  CONSTRAINT `asiento_ibfk_1`
    FOREIGN KEY (`idSala`)
    REFERENCES `cine_upn_db`.`sala` (`idSala`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`rol`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`rol` (
  `idRol` INT NOT NULL AUTO_INCREMENT,
  `nombreRol` VARCHAR(50) NOT NULL,
  `descripcion` VARCHAR(150) NULL DEFAULT NULL,
  `estado` TINYINT(1) NULL DEFAULT '1',
  PRIMARY KEY (`idRol`),
  UNIQUE INDEX `nombreRol` (`nombreRol` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`usuario` (
  `idUsuario` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `contrasenia` VARCHAR(255) NOT NULL,
  `nombres` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100) NOT NULL,
  `idRol` INT NOT NULL,
  `estado` TINYINT(1) NULL DEFAULT '1',
  PRIMARY KEY (`idUsuario`),
  UNIQUE INDEX `username` (`username` ASC) VISIBLE,
  INDEX `fk_usuario_rol` (`idRol` ASC) VISIBLE,
  CONSTRAINT `fk_usuario_rol`
    FOREIGN KEY (`idRol`)
    REFERENCES `cine_upn_db`.`rol` (`idRol`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`caja`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`caja` (
  `idSesionCaja` INT NOT NULL AUTO_INCREMENT,
  `idUsuario` INT NULL DEFAULT NULL,
  `numeroCajaFisica` INT NOT NULL,
  `fechaHorarioApertura` DATETIME NOT NULL,
  `fechaHorarioCierre` DATETIME NULL DEFAULT NULL,
  `montoApertura` DECIMAL(10,2) NOT NULL,
  `montoCierreSistema` DECIMAL(10,2) NULL DEFAULT NULL,
  `montoCierreReal` DECIMAL(10,2) NULL DEFAULT NULL,
  `estado` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idSesionCaja`),
  INDEX `idUsuario` (`idUsuario` ASC) VISIBLE,
  CONSTRAINT `caja_ibfk_1`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `cine_upn_db`.`usuario` (`idUsuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`pelicula`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`pelicula` (
  `idPelicula` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(150) NOT NULL,
  `duracion` INT NOT NULL,
  `genero` VARCHAR(50) NOT NULL,
  `sipnosis` TEXT NULL DEFAULT NULL,
  `imagenPoster` LONGBLOB NULL DEFAULT NULL,
  PRIMARY KEY (`idPelicula`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`funcion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`funcion` (
  `idFuncion` INT NOT NULL AUTO_INCREMENT,
  `idPelicula` INT NULL DEFAULT NULL,
  `idSala` INT NULL DEFAULT NULL,
  `fecha` DATE NOT NULL,
  `horarioInicio` VARCHAR(10) NOT NULL,
  `horarioFin` VARCHAR(10) NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  `precioBase` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`idFuncion`),
  INDEX `idPelicula` (`idPelicula` ASC) VISIBLE,
  INDEX `idSala` (`idSala` ASC) VISIBLE,
  CONSTRAINT `funcion_ibfk_1`
    FOREIGN KEY (`idPelicula`)
    REFERENCES `cine_upn_db`.`pelicula` (`idPelicula`),
  CONSTRAINT `funcion_ibfk_2`
    FOREIGN KEY (`idSala`)
    REFERENCES `cine_upn_db`.`sala` (`idSala`))
ENGINE = InnoDB
AUTO_INCREMENT = 13
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`control_reserva_temporal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`control_reserva_temporal` (
  `idFuncion` INT NOT NULL,
  `idAsiento` INT NOT NULL,
  `estado` ENUM('Disponible', 'Reservado_Temporal', 'Ocupado') NULL DEFAULT 'Disponible',
  `fecha_reserva` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`idFuncion`, `idAsiento`),
  INDEX `idAsiento` (`idAsiento` ASC) VISIBLE,
  CONSTRAINT `control_reserva_temporal_ibfk_1`
    FOREIGN KEY (`idFuncion`)
    REFERENCES `cine_upn_db`.`funcion` (`idFuncion`),
  CONSTRAINT `control_reserva_temporal_ibfk_2`
    FOREIGN KEY (`idAsiento`)
    REFERENCES `cine_upn_db`.`asiento` (`idAsiento`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`cuadre_de_caja`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`cuadre_de_caja` (
  `idCuadre` INT NOT NULL AUTO_INCREMENT,
  `idSesionCaja` INT NULL DEFAULT NULL,
  `diferencia` DECIMAL(10,2) NOT NULL,
  `observaciones` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`idCuadre`),
  UNIQUE INDEX `idSesionCaja` (`idSesionCaja` ASC) VISIBLE,
  CONSTRAINT `cuadre_de_caja_ibfk_1`
    FOREIGN KEY (`idSesionCaja`)
    REFERENCES `cine_upn_db`.`caja` (`idSesionCaja`))
ENGINE = InnoDB
AUTO_INCREMENT = 2
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`ingreso`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`ingreso` (
  `idNotaIngreso` INT NOT NULL AUTO_INCREMENT,
  `idUsuario` INT NULL DEFAULT NULL,
  `fechaRegistro` DATE NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idNotaIngreso`),
  INDEX `idUsuario` (`idUsuario` ASC) VISIBLE,
  CONSTRAINT `ingreso_ibfk_1`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `cine_upn_db`.`usuario` (`idUsuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 8
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`insumo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`insumo` (
  `idInsumo` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `stockActual` INT NOT NULL,
  `stockMinimo` INT NOT NULL,
  `precioSugerido` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`idInsumo`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`detalle_ingreso`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`detalle_ingreso` (
  `idNotaIngreso` INT NOT NULL,
  `idInsumo` INT NOT NULL,
  `cantidadRecibida` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`idNotaIngreso`, `idInsumo`),
  INDEX `idInsumo` (`idInsumo` ASC) VISIBLE,
  CONSTRAINT `detalle_ingreso_ibfk_1`
    FOREIGN KEY (`idNotaIngreso`)
    REFERENCES `cine_upn_db`.`ingreso` (`idNotaIngreso`),
  CONSTRAINT `detalle_ingreso_ibfk_2`
    FOREIGN KEY (`idInsumo`)
    REFERENCES `cine_upn_db`.`insumo` (`idInsumo`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`proveedor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`proveedor` (
  `idProveedor` INT NOT NULL AUTO_INCREMENT,
  `ruc` VARCHAR(11) NOT NULL,
  `razonSocial` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(200) NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idProveedor`),
  UNIQUE INDEX `ruc` (`ruc` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`orden`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`orden` (
  `idOrdenCompra` INT NOT NULL AUTO_INCREMENT,
  `idProveedor` INT NULL DEFAULT NULL,
  `idUsuario` INT NULL DEFAULT NULL,
  `fechaRegistro` DATE NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idOrdenCompra`),
  INDEX `idProveedor` (`idProveedor` ASC) VISIBLE,
  INDEX `idUsuario` (`idUsuario` ASC) VISIBLE,
  CONSTRAINT `orden_ibfk_1`
    FOREIGN KEY (`idProveedor`)
    REFERENCES `cine_upn_db`.`proveedor` (`idProveedor`),
  CONSTRAINT `orden_ibfk_2`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `cine_upn_db`.`usuario` (`idUsuario`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`detalle_orden`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`detalle_orden` (
  `idOrdenCompra` INT NOT NULL,
  `idInsumo` INT NOT NULL,
  `cantidadRequerida` INT NOT NULL,
  `precioCompra` DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`idOrdenCompra`, `idInsumo`),
  INDEX `idInsumo` (`idInsumo` ASC) VISIBLE,
  CONSTRAINT `detalle_orden_ibfk_1`
    FOREIGN KEY (`idOrdenCompra`)
    REFERENCES `cine_upn_db`.`orden` (`idOrdenCompra`),
  CONSTRAINT `detalle_orden_ibfk_2`
    FOREIGN KEY (`idInsumo`)
    REFERENCES `cine_upn_db`.`insumo` (`idInsumo`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`venta`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`venta` (
  `idVenta` INT NOT NULL AUTO_INCREMENT,
  `idCliente` INT NULL DEFAULT NULL,
  `fechaHora` DATETIME NOT NULL,
  `cantidadBoletos` INT NULL DEFAULT '0',
  `montoBruto` DECIMAL(10,2) NOT NULL,
  `montoDescuento` DECIMAL(10,2) NULL DEFAULT '0.00',
  `montoTotalNeto` DECIMAL(10,2) NOT NULL,
  `tipoVenta` ENUM('Online', 'Taquilla', 'Confiteria') NOT NULL,
  `estado` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idVenta`),
  INDEX `idCliente` (`idCliente` ASC) VISIBLE,
  CONSTRAINT `venta_ibfk_1`
    FOREIGN KEY (`idCliente`)
    REFERENCES `cine_upn_db`.`cliente` (`id_cliente`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`producto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`producto` (
  `idProducto` INT NOT NULL AUTO_INCREMENT,
  `nombreProducto` VARCHAR(100) NOT NULL,
  `categoria` ENUM('Combo', 'Bebida', 'Snack', 'Otro') NOT NULL,
  `precioVenta` DECIMAL(10,2) NOT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`idProducto`))
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`detalle_venta`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`detalle_venta` (
  `idComprobante` INT NOT NULL AUTO_INCREMENT,
  `idVenta` INT NULL DEFAULT NULL,
  `idFuncion` INT NULL DEFAULT NULL,
  `idAsiento` INT NULL DEFAULT NULL,
  `idProducto` INT NULL DEFAULT NULL,
  `item_comprado` VARCHAR(150) NOT NULL,
  `montoPagado` DECIMAL(10,2) NOT NULL,
  `vuelto` DECIMAL(10,2) NULL DEFAULT '0.00',
  PRIMARY KEY (`idComprobante`),
  INDEX `idVenta` (`idVenta` ASC) VISIBLE,
  INDEX `idFuncion` (`idFuncion` ASC) VISIBLE,
  INDEX `idAsiento` (`idAsiento` ASC) VISIBLE,
  INDEX `idProducto` (`idProducto` ASC) VISIBLE,
  CONSTRAINT `detalle_venta_ibfk_1`
    FOREIGN KEY (`idVenta`)
    REFERENCES `cine_upn_db`.`venta` (`idVenta`),
  CONSTRAINT `detalle_venta_ibfk_2`
    FOREIGN KEY (`idFuncion`)
    REFERENCES `cine_upn_db`.`funcion` (`idFuncion`),
  CONSTRAINT `detalle_venta_ibfk_3`
    FOREIGN KEY (`idAsiento`)
    REFERENCES `cine_upn_db`.`asiento` (`idAsiento`),
  CONSTRAINT `detalle_venta_ibfk_4`
    FOREIGN KEY (`idProducto`)
    REFERENCES `cine_upn_db`.`producto` (`idProducto`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`movimiento_de_caja`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`movimiento_de_caja` (
  `idMovimiento` INT NOT NULL AUTO_INCREMENT,
  `idSesionCaja` INT NULL DEFAULT NULL,
  `idVenta` INT NULL DEFAULT NULL,
  `tipoMovimiento` VARCHAR(50) NOT NULL,
  `monto` DECIMAL(10,2) NOT NULL,
  `hora` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`idMovimiento`),
  INDEX `idSesionCaja` (`idSesionCaja` ASC) VISIBLE,
  INDEX `idVenta` (`idVenta` ASC) VISIBLE,
  CONSTRAINT `movimiento_de_caja_ibfk_1`
    FOREIGN KEY (`idSesionCaja`)
    REFERENCES `cine_upn_db`.`caja` (`idSesionCaja`),
  CONSTRAINT `movimiento_de_caja_ibfk_2`
    FOREIGN KEY (`idVenta`)
    REFERENCES `cine_upn_db`.`venta` (`idVenta`))
ENGINE = InnoDB
AUTO_INCREMENT = 15
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `cine_upn_db`.`receta_producto_insumo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `cine_upn_db`.`receta_producto_insumo` (
  `idInsumo` INT NOT NULL,
  `idProducto` INT NOT NULL,
  `cantidad_a_descontar` INT NOT NULL,
  PRIMARY KEY (`idInsumo`, `idProducto`),
  INDEX `idProducto` (`idProducto` ASC) VISIBLE,
  CONSTRAINT `receta_producto_insumo_ibfk_1`
    FOREIGN KEY (`idInsumo`)
    REFERENCES `cine_upn_db`.`insumo` (`idInsumo`),
  CONSTRAINT `receta_producto_insumo_ibfk_2`
    FOREIGN KEY (`idProducto`)
    REFERENCES `cine_upn_db`.`producto` (`idProducto`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
