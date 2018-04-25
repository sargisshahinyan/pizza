-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 25, 2018 at 04:27 PM
-- Server version: 10.1.28-MariaDB
-- PHP Version: 7.1.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pizza`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` tinytext NOT NULL,
  `image` tinytext NOT NULL,
  `bgImage` tinytext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `image`, `bgImage`) VALUES
(1, 'Pizza', '/img/categories/icons/pizza.png', '/img/categories/pizza.jpg'),
(2, 'Appetizers', '/img/categories/icons/appetizers.png', '/img/categories/appetizers.jpg'),
(3, 'Salads', '/img/categories/icons/salads.png', '/img/categories/salads.jpg'),
(4, 'Sandwiches', '/img/categories/icons/sandwiches.png', '/img/categories/sandwiches.jpg'),
(5, 'Hamburgers', '/img/categories/icons/hamburgers.png', '/img/categories/hamburgers.jpg'),
(6, 'Pasta', '/img/categories/icons/pasta.png', '/img/categories/pasta.jpg'),
(7, 'Beverages', '/img/categories/icons/beverages.png', '/img/categories/beverages.jpg'),
(8, 'Dessert', '/img/categories/icons/dessert.png', '/img/categories/dessert.jpg'),
(9, 'Ajarski', '/img/categories/icons/ajarski.png', '/img/categories/ajarski.jpg'),
(10, 'Specials', '/img/categories/icons/spec.png', '/img/categories/spec_off.png');

-- --------------------------------------------------------

--
-- Table structure for table `orderdetails`
--

CREATE TABLE `orderdetails` (
  `id` int(11) NOT NULL,
  `orderId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `instructions` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `orderdetails`
--

INSERT INTO `orderdetails` (`id`, `orderId`, `productId`, `quantity`, `instructions`) VALUES
(1, 1, 1, 2, 'ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg   gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggv'),
(2, 1, 2, 3, NULL),
(3, 2, 1, 2, NULL),
(4, 2, 2, 3, NULL),
(5, 3, 1, 2, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `email` tinytext NOT NULL,
  `phone` varchar(50) NOT NULL,
  `address1` tinytext NOT NULL,
  `address2` varchar(50) NOT NULL,
  `city` varchar(50) NOT NULL,
  `stateId` varchar(2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `date`, `firstName`, `lastName`, `email`, `phone`, `address1`, `address2`, `city`, `stateId`) VALUES
(1, '2018-04-10 17:40:11', 'Sargis', 'Shahinyan', 'shahinyan.sargis@gmail.com', '3024148567', '950 Ridge RD C25, T4557', '950 Ridge RD C25, T4557', 'Claymont', 'DE'),
(2, '2018-04-17 10:45:56', 'Sargis', 'Shahinyan', '', '', 'Մոլդովական փ. 2/2 բնակարան 15', '', 'Երեվան', 'MA'),
(3, '2018-04-21 07:05:23', 'Sargis', 'Shahinyan', '', '', '950 Ridge RD C25, T4557', '950 Ridge RD C25, T4557', 'Claymont', 'DE');

-- --------------------------------------------------------

--
-- Table structure for table `ordersubcategories`
--

CREATE TABLE `ordersubcategories` (
  `orderDetailId` int(11) NOT NULL,
  `subcategoryId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `ordersubcategories`
--

INSERT INTO `ordersubcategories` (`orderDetailId`, `subcategoryId`) VALUES
(1, 5),
(1, 34),
(1, 17),
(1, 37),
(1, 21),
(2, 49),
(2, 52),
(3, 3),
(4, 50),
(4, 51),
(4, 63),
(5, 5),
(5, 34),
(5, 18),
(5, 37),
(5, 20);

-- --------------------------------------------------------

--
-- Table structure for table `prices`
--

CREATE TABLE `prices` (
  `productId` int(11) NOT NULL,
  `subcategoryId` int(11) NOT NULL,
  `price` decimal(8,2) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `prices`
--

INSERT INTO `prices` (`productId`, `subcategoryId`, `price`) VALUES
(1, 3, '11.99'),
(1, 4, '12.99'),
(1, 5, '17.99'),
(1, 6, '20.99'),
(1, 7, '22.99'),
(1, 13, '0.00'),
(1, 14, '0.00'),
(1, 15, '0.50'),
(1, 16, '0.00'),
(1, 17, '0.00'),
(1, 18, '0.50'),
(1, 19, '0.00'),
(1, 20, '0.00'),
(1, 21, '0.50'),
(1, 22, '0.00'),
(1, 23, '0.00'),
(1, 24, '0.50'),
(1, 25, '0.00'),
(1, 26, '0.00'),
(1, 27, '0.50'),
(1, 28, '0.00'),
(1, 29, '0.00'),
(1, 30, '0.00'),
(1, 34, '0.00'),
(1, 35, '0.00'),
(1, 36, '0.00'),
(1, 37, '0.00'),
(1, 38, '0.00'),
(1, 39, '0.00'),
(1, 40, '0.00'),
(1, 41, '0.00'),
(1, 42, '0.00'),
(1, 43, '0.00'),
(1, 44, '0.00'),
(1, 45, '0.00'),
(2, 49, '4.50'),
(2, 50, '6.99'),
(2, 51, '0.00'),
(2, 52, '2.50'),
(2, 58, '0.00'),
(2, 59, '0.00'),
(2, 60, '0.50'),
(2, 61, '0.00'),
(2, 62, '0.00'),
(2, 63, '0.50'),
(2, 64, '0.00'),
(2, 65, '0.00'),
(2, 66, '0.50'),
(2, 67, '0.00'),
(2, 68, '0.00'),
(2, 69, '0.50'),
(2, 70, '0.00'),
(2, 71, '0.00'),
(2, 72, '0.50');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` tinytext NOT NULL,
  `categoryId` int(11) NOT NULL,
  `description` text NOT NULL,
  `image` tinytext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `categoryId`, `description`, `image`) VALUES
(1, '5 Cheese Pizza', 1, 'Red sauce, mozzarella, feta cheese, chedder cheese, ricotta and provolone.', '/img/products/1518002571645.png'),
(2, 'Garden Salad', 3, 'Lettuce, tomatoes, onions and bell peppers. Your choice of dressing.', '/img/products/1517643306729.png');

-- --------------------------------------------------------

--
-- Table structure for table `states`
--

CREATE TABLE `states` (
  `id` varchar(2) NOT NULL,
  `name` tinytext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `states`
--

INSERT INTO `states` (`id`, `name`) VALUES
('AK', 'Alaska'),
('AL', 'Alabama'),
('AR', 'Arkansas'),
('AZ', 'Arizona'),
('CA', 'California'),
('CO', 'Colorado'),
('CT', 'Connecticut'),
('DC', 'District of Columbia'),
('DE', 'Delaware'),
('FL', 'Florida'),
('GA', 'Georgia'),
('HI', 'Hawaii'),
('IA', 'Iowa'),
('ID', 'Idaho'),
('IL', 'Illinois'),
('IN', 'Indiana'),
('KS', 'Kansas'),
('KY', 'Kentucky'),
('LA', 'Louisiana'),
('MA', 'Massachusetts'),
('MD', 'Maryland'),
('ME', 'Maine'),
('MI', 'Michigan'),
('MN', 'Minnesota'),
('MO', 'Missouri'),
('MS', 'Mississippi'),
('MT', 'Montana'),
('NC', 'North Carolina'),
('ND', 'North Dakota'),
('NE', 'Nebraska'),
('NH', 'New Hampshire'),
('NJ', 'New Jersey'),
('NM', 'New Mexico'),
('NV', 'Nevada'),
('NY', 'New York'),
('OH', 'Ohio'),
('OK', 'Oklahoma'),
('OR', 'Oregon'),
('PA', 'Pennsylvania'),
('RI', 'Rhode Island'),
('SC', 'South Carolina'),
('SD', 'South Dakota'),
('TN', 'Tennessee'),
('TX', 'Texas'),
('UT', 'Utah'),
('VA', 'Virginia'),
('VT', 'Vermont'),
('WA', 'Washington'),
('WI', 'Wisconsin'),
('WV', 'West Virginia'),
('WY', 'Wyoming');

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL,
  `name` tinytext NOT NULL,
  `parentId` int(11) DEFAULT NULL,
  `selected` tinyint(1) NOT NULL DEFAULT '0',
  `type` tinyint(4) NOT NULL DEFAULT '0',
  `quantity` tinyint(4) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`id`, `name`, `parentId`, `selected`, `type`, `quantity`) VALUES
(1, 'Choose a Size', NULL, 1, 0, 1),
(2, 'Pizza Toppings', NULL, 1, 0, 0),
(3, 'Small 10\"', 1, 1, 1, 1),
(4, 'Medium 14\"', 1, 0, 1, 1),
(5, 'Large 16\"', 1, 0, 1, 1),
(6, 'XLarge 18\"', 1, 0, 1, 1),
(7, 'Calzone', 1, 0, 1, 1),
(8, 'Pepperoni', 2, 0, 4, NULL),
(9, 'Sausage', 2, 0, 4, NULL),
(10, 'Ham', 2, 0, 4, NULL),
(11, 'Salami', 2, 0, 4, NULL),
(12, 'Ground Beef', 2, 0, 4, NULL),
(13, 'Light', 8, 0, 3, NULL),
(14, 'Regular', 8, 1, 3, NULL),
(15, 'Extra', 8, 0, 3, NULL),
(16, 'Light', 9, 0, 3, NULL),
(17, 'Regular', 9, 1, 3, NULL),
(18, 'Extra', 9, 0, 3, NULL),
(19, 'Light', 10, 0, 3, NULL),
(20, 'Regular', 10, 1, 3, NULL),
(21, 'Extra', 10, 0, 3, NULL),
(22, 'Light', 11, 0, 3, NULL),
(23, 'Regular', 11, 1, 3, NULL),
(24, 'Extra', 11, 0, 3, NULL),
(25, 'Light', 12, 0, 3, NULL),
(26, 'Regular', 12, 1, 3, NULL),
(27, 'Extra', 12, 0, 3, NULL),
(28, 'Whole', 8, 1, 2, NULL),
(29, 'Left Side', 8, 0, 2, NULL),
(30, 'Right Side', 8, 0, 2, NULL),
(34, 'Whole', 9, 1, 2, NULL),
(35, 'Left Side', 9, 0, 2, NULL),
(36, 'Right Side', 9, 0, 2, NULL),
(37, 'Whole', 10, 1, 2, NULL),
(38, 'Left Side', 10, 0, 2, NULL),
(39, 'Right Side', 10, 0, 2, NULL),
(40, 'Whole', 11, 1, 2, NULL),
(41, 'Left Side', 11, 0, 2, NULL),
(42, 'Right Side', 11, 0, 2, NULL),
(43, 'Whole', 12, 1, 2, NULL),
(44, 'Left Side', 12, 0, 2, NULL),
(45, 'Right Side', 12, 0, 2, NULL),
(46, 'Choose a size', NULL, 1, 0, NULL),
(47, 'Add Chicken Breast', NULL, 1, 0, NULL),
(48, 'Salad Dressing Options', NULL, 1, 0, 1),
(49, 'Small', 46, 1, 1, NULL),
(50, 'Large', 46, 0, 1, NULL),
(51, 'No chicken breast.', 47, 1, 1, NULL),
(52, 'Add chicken breast.', 47, 0, 1, NULL),
(53, 'Ranch', 48, 0, 4, NULL),
(54, 'Blue Cheese', 48, 0, 4, NULL),
(55, 'Italian', 48, 0, 4, NULL),
(56, 'Caesar', 48, 0, 4, NULL),
(57, 'No Dressing', 48, 0, 4, NULL),
(58, 'Light', 53, 0, 3, 1),
(59, 'Regular', 53, 1, 3, 1),
(60, 'Extra', 53, 0, 3, 1),
(61, 'Light', 54, 0, 3, 1),
(62, 'Regular', 54, 1, 3, 1),
(63, 'Extra', 54, 0, 3, 1),
(64, 'Light', 55, 0, 3, 1),
(65, 'Regular', 55, 1, 3, 1),
(66, 'Extra', 55, 0, 3, 1),
(67, 'Light', 56, 0, 3, 1),
(68, 'Regular', 56, 1, 3, 1),
(69, 'Extra', 56, 0, 3, 1),
(70, 'Light', 57, 0, 3, 1),
(71, 'Regular', 57, 1, 3, 1),
(72, 'Extra', 57, 0, 3, 1);

-- --------------------------------------------------------

--
-- Table structure for table `tokens`
--

CREATE TABLE `tokens` (
  `userId` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tokens`
--

INSERT INTO `tokens` (`userId`, `token`, `expDate`) VALUES
(1, '12345', '2018-04-21 07:07:38'),
(1, 'i0B1p0YV7Z7ZHWyJUJKWJ8QBz6qAp3zY3zrX65ZWvx7mEmyz2vCpYQ4k3iZi05Gx', '2018-04-24 09:29:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(24) NOT NULL,
  `username` varchar(24) NOT NULL,
  `password` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`) VALUES
(1, 'Sargis', 'admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orderdetails`
--
ALTER TABLE `orderdetails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orderId` (`orderId`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stateId` (`stateId`);

--
-- Indexes for table `ordersubcategories`
--
ALTER TABLE `ordersubcategories`
  ADD KEY `orderDetailsId` (`orderDetailId`),
  ADD KEY `subcategoryId` (`subcategoryId`);

--
-- Indexes for table `prices`
--
ALTER TABLE `prices`
  ADD PRIMARY KEY (`productId`,`subcategoryId`),
  ADD KEY `subcategoryId` (`subcategoryId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoryId` (`categoryId`);

--
-- Indexes for table `states`
--
ALTER TABLE `states`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parentId` (`parentId`);

--
-- Indexes for table `tokens`
--
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`userId`,`token`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `orderdetails`
--
ALTER TABLE `orderdetails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orderdetails`
--
ALTER TABLE `orderdetails`
  ADD CONSTRAINT `orderdetails_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orderdetails_ibfk_3` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`stateId`) REFERENCES `states` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ordersubcategories`
--
ALTER TABLE `ordersubcategories`
  ADD CONSTRAINT `ordersubcategories_ibfk_1` FOREIGN KEY (`orderDetailId`) REFERENCES `orderdetails` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ordersubcategories_ibfk_2` FOREIGN KEY (`subcategoryId`) REFERENCES `subcategories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `prices`
--
ALTER TABLE `prices`
  ADD CONSTRAINT `prices_ibfk_1` FOREIGN KEY (`subcategoryId`) REFERENCES `subcategories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `prices_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`parentId`) REFERENCES `subcategories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tokens`
--
ALTER TABLE `tokens`
  ADD CONSTRAINT `tokens_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
