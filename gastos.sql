-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-04-2025 a las 05:49:21
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gastos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conceptos`
--

CREATE TABLE `conceptos` (
  `id` int(11) NOT NULL,
  `rubro_id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo` enum('ingreso','egreso') NOT NULL DEFAULT 'egreso',
  `requiere_vencimiento` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `conceptos`
--

INSERT INTO `conceptos` (`id`, `rubro_id`, `nombre`, `tipo`, `requiere_vencimiento`) VALUES
(42, 83, 'Patente', 'egreso', 1),
(43, 83, 'Cochera', 'egreso', 0),
(44, 83, 'Seguro', 'egreso', 0),
(45, 81, 'Metrogas', 'egreso', 1),
(46, 81, 'Edenor', 'egreso', 1),
(47, 81, 'ABL', 'egreso', 1),
(48, 81, 'Expensas', 'egreso', 0),
(49, 82, 'Internet', 'egreso', 1),
(50, 82, 'Telefonia Celular', 'egreso', 0),
(51, 84, 'Medicus', 'egreso', 1),
(52, 79, 'Colegio Raices', 'egreso', 0),
(53, 79, 'Natacion Raices', 'egreso', 0),
(54, 79, 'Ingles Raices', 'egreso', 0),
(55, 86, 'Futbol', 'egreso', 0),
(56, 79, 'Campamento', 'egreso', 1),
(57, 79, 'Materiales Raices', 'egreso', 0),
(58, 79, 'Matricula Raices', 'egreso', 1),
(59, 85, 'Youtube', 'egreso', 0),
(60, 85, 'Spotify', 'egreso', 0),
(61, 88, 'Visa BBVA', 'egreso', 1),
(62, 88, 'Master BBVA', 'egreso', 1),
(63, 80, 'Sueldo Vani', 'ingreso', 0),
(64, 80, 'Sueldo Criss', 'ingreso', 0),
(65, 80, 'Aguinaldo Criss', 'ingreso', 0),
(66, 80, 'Aguinaldo Vani', 'ingreso', 0),
(67, 80, 'Bono Criss', 'ingreso', 0),
(68, 80, 'Bono Vani', 'ingreso', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gastos`
--

CREATE TABLE `gastos` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `concepto_id` int(11) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `mes` int(11) NOT NULL,
  `anio` int(11) NOT NULL,
  `tipo` enum('ingreso','egreso') NOT NULL DEFAULT 'egreso',
  `pagado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `gastos`
--

INSERT INTO `gastos` (`id`, `fecha`, `monto`, `concepto_id`, `fecha_vencimiento`, `mes`, `anio`, `tipo`, `pagado`) VALUES
(34, '0000-00-00', 1910000.00, 64, NULL, 4, 2025, 'ingreso', 0),
(37, '0000-00-00', 250000.00, 52, NULL, 4, 2025, 'egreso', 0),
(38, '0000-00-00', 51000.00, 51, '2025-04-04', 4, 2025, 'egreso', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rubros`
--

CREATE TABLE `rubros` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `rubros`
--

INSERT INTO `rubros` (`id`, `nombre`) VALUES
(83, 'Automotor'),
(82, 'Comunicaciones'),
(86, 'Deporte'),
(79, 'Educacion'),
(85, 'Plataformas'),
(84, 'Salud'),
(81, 'Servicios Gabriela Mistral'),
(80, 'Sueldos'),
(88, 'Tarjetas'),
(87, 'Varios');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `password`) VALUES
(3, 'admin', '$2b$10$M6bQl/qv.eJJ0625x6r/oOhBAoRstu.KzNREx9Mchgj9brxak3cbK');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `conceptos`
--
ALTER TABLE `conceptos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`,`rubro_id`),
  ADD KEY `rubro_id` (`rubro_id`);

--
-- Indices de la tabla `gastos`
--
ALTER TABLE `gastos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `concepto_id` (`concepto_id`);

--
-- Indices de la tabla `rubros`
--
ALTER TABLE `rubros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `conceptos`
--
ALTER TABLE `conceptos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT de la tabla `gastos`
--
ALTER TABLE `gastos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT de la tabla `rubros`
--
ALTER TABLE `rubros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `conceptos`
--
ALTER TABLE `conceptos`
  ADD CONSTRAINT `conceptos_ibfk_1` FOREIGN KEY (`rubro_id`) REFERENCES `rubros` (`id`),
  ADD CONSTRAINT `fk_conceptos_rubro` FOREIGN KEY (`rubro_id`) REFERENCES `rubros` (`id`);

--
-- Filtros para la tabla `gastos`
--
ALTER TABLE `gastos`
  ADD CONSTRAINT `fk_gastos_concepto` FOREIGN KEY (`concepto_id`) REFERENCES `conceptos` (`id`),
  ADD CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`concepto_id`) REFERENCES `conceptos` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
