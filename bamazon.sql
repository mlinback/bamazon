-- Drops the bamazon_db if it exists currently --
DROP DATABASE IF EXISTS bamazon_db;
-- Creates the "bamazon_db" database --
CREATE DATABASE bamazon_db;

-- Makes it so all of the following code will affect bamazon_db --
USE bamazon_db;

-- Creates the table "products" with bamazon_db --
CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR (100) NOT NULL,
    department_name VARCHAR(90) NOT NULL,
    price INT default 0,
    stock_quantity INT default 0,
    PRIMARY KEY (item_id)
);

-- Creates new rows containing data in all named columns --
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Basketball", "Sporting Goods", 20, 236),
    ("Chair", "Furniture", 175, 94),
    ("52 Inch Tv", "Entertainment", 350, 74),
    ("17 Inch Laptop", "Entertainment", 568, 213),
    ("Queen Size Bed", "Furniture", 498, 634),
    ("Pillow", "Bedding", 14, 456),
    ("Bread", "Grocery", 2, 5456),
    ("Lamp", "Furniture", 734, 642),
    ("Hockey Stick", "Sporting Goods", 75, 643),
    ("Hamms", "Grocery", 12, 4);

-- View table
SELECT * FROM products;