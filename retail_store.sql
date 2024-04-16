# 1. 	Create database
DROP DATABASE IF EXISTS retail_store;
CREATE DATABASE retail_store;

# 2.	Create all the necessary tables
USE retail_store; 

CREATE TABLE products (
  product_id INT AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(50),
  product_description VARCHAR(200),
  product_sales_price FLOAT(5,2),
  product_purchased_price FLOAT(5,2),
  quantity INT(3),
  PRIMARY KEY (product_id)
);

CREATE TABLE delivery_address (
  delivery_address_id INT AUTO_INCREMENT NOT NULL,
  -- customer_id INT(4),
  street_delivery VARCHAR(100),
  city_delivery VARCHAR(50),
  postal_code_delivery VARCHAR(20),
  country_delivery VARCHAR(100),  
  PRIMARY KEY (delivery_address_id)
  -- FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON UPDATE CASCADE
);

CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT NOT NULL,
  first_name VARCHAR(20),
  last_name VARCHAR(20),
  tel_no VARCHAR(30),
  email VARCHAR(50),
  user_name VARCHAR(50),
  user_password VARCHAR(255),
  user_salt VARCHAR(255),
  street VARCHAR(100),
  city VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  same_billing_delivery_address BOOLEAN,
  delivery_address_id INT(4),
  PRIMARY KEY (customer_id),
  FOREIGN KEY (delivery_address_id) REFERENCES delivery_address (delivery_address_id) ON UPDATE CASCADE
);

DELIMITER //
CREATE TRIGGER after_insert_delivery_address
AFTER INSERT
ON delivery_address FOR EACH ROW
BEGIN
    DECLARE last_delivery_address_id INT;
    SET last_delivery_address_id = (SELECT delivery_address_id FROM delivery_address ORDER BY delivery_address_id DESC LIMIT 1);
    UPDATE customers SET delivery_address_id = last_delivery_address_id ORDER BY customer_id DESC LIMIT 1;
END;//
DELIMITER ;

CREATE TABLE order_items (
  order_items_id INT AUTO_INCREMENT NOT NULL,
  product_id INT(4),
  quantity FLOAT(4,2),
  customer_id INT(4),
  PRIMARY KEY (order_items_id),
  FOREIGN KEY (product_id) REFERENCES products (product_id) ON UPDATE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers (customer_id) ON UPDATE CASCADE
);

CREATE TABLE order_status (
  order_status_id INT AUTO_INCREMENT NOT NULL,
  order_status_name VARCHAR(20),
  PRIMARY KEY (Order_status_id)
);

CREATE TABLE customer_orders (
  order_id INT AUTO_INCREMENT NOT NULL,
  order_items_id INT(3),
  order_status_id INT(2),
  date_order_done DATE,
  date_order_delivered DATE,
  PRIMARY KEY (Order_id),
  FOREIGN KEY (order_items_id) REFERENCES order_items (order_items_id) ON UPDATE CASCADE,
  FOREIGN KEY (order_status_id) REFERENCES order_status (order_status_id) ON UPDATE CASCADE
); 

# 3. Populating some data by default
INSERT INTO 
	products (product_name, product_description, product_sales_price, product_purchased_price, quantity) 
VALUES
('Product A', 'Description of product A', 70.00, 40.00, 1),
('Product B', 'Description of product B', 70.00, 40.00, 2),
('Product C', 'Description of product C', 70.00, 40.00, 3);


