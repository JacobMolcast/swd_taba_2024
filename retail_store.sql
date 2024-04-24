# 1. 	Create database
DROP DATABASE IF EXISTS retail_store;
CREATE DATABASE retail_store;

# 2.	Create tables
USE retail_store; 

CREATE TABLE delivery_address (
  delivery_address_id INT AUTO_INCREMENT NOT NULL,
  street_delivery CHAR(32),
  city_delivery CHAR(32),
  postal_code_delivery CHAR(32),
  country_delivery CHAR(32),  
  PRIMARY KEY (delivery_address_id)
);

CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT NOT NULL,
  first_name CHAR(33),
  last_name CHAR(33),
  tel_no CHAR(33),
  email CHAR(33),
  user_name CHAR(33),
  user_password CHAR(64),
  user_salt VARCHAR(64),
  street CHAR(32),
  city CHAR(32),
  postal_code CHAR(32),
  country CHAR(32),
  same_billing_delivery_address BOOLEAN,
  delivery_address_id INT(4),
  admin_role BOOL DEFAULT 0,
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


