const db = require("../db.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {encrypt, decrypt} = require("./crypto");

let delivery_address_id = 0;

const retrieve = (req, res) => {
  db.query(
    `SELECT * FROM customers LEFT JOIN delivery_address USING (delivery_address_id) WHERE customer_id = ?`,
    [req.user.customer_id],
    (error, results) => {
      if (error) {
        res.redirect("/dashboard");
      } else {
        if (results[0] && results[0].same_billing_delivery_address === 0) {
          delivery_address_id = results[0].delivery_address_id;
          res.render("edit-profile", {
            first_name: decrypt(results[0].first_name),
            last_name: decrypt(results[0].last_name),
            tel_no: decrypt(results[0].tel_no),
            email: decrypt(results[0].email),
            user_name: decrypt(results[0].user_name),
            street: decrypt(results[0].street),
            city: decrypt(results[0].city),
            postal_code: decrypt(results[0].postal_code),
            country: decrypt(results[0].country),
            street_delivery: decrypt(results[0].street_delivery),
            city_delivery: decrypt(results[0].city_delivery),
            postal_code_delivery: decrypt(results[0].postal_code_delivery),
            country_delivery: decrypt(results[0].country_delivery),
          });
        } else if (results[0] && results[0].same_billing_delivery_address === 1) {
          res.render("edit-profile", {
            first_name: decrypt(results[0].first_name),
            last_name: decrypt(results[0].last_name),
            tel_no: decrypt(results[0].tel_no),
            email: decrypt(results[0].email),
            user_name: decrypt(results[0].user_name),
            street: decrypt(results[0].street),
            city: decrypt(results[0].city),
            postal_code: decrypt(results[0].postal_code),
            country: decrypt(results[0].country),
            street_delivery: decrypt(results[0].street),
            city_delivery: decrypt(results[0].city),
            postal_code_delivery: decrypt(results[0].postal_code),
            country_delivery: decrypt(results[0].country),
          });
        } else {
          res.redirect("/dashboard");
        }
      }
    },
  );
};

update = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    let sql;
    let sqlValues;
    if (req.body.same_billing_delivery_address === "on") {
      sql = `
        UPDATE customers SET
          first_name = ?,
          last_name = ?,
          tel_no = ?,
          email = ?,
          user_name = ?,
          user_password = ?,
          user_salt = ?,
          street = ?,
          city = ?,
          postal_code = ?,
          country = ?,
          same_billing_delivery_address = ?
          WHERE customer_id = ?;
        `;
      sqlValues = [
        encrypt(req.body.first_name),
        encrypt(req.body.last_name),
        encrypt(req.body.tel_no),
        encrypt(req.body.email),
        encrypt(req.body.user_name),
        hashedPassword,
        salt,
        encrypt(req.body.street),
        encrypt(req.body.city),
        encrypt(req.body.postal_code),
        encrypt(req.body.country),
        1,
        req.user.customer_id,
      ];
    } else {
      sql = `
        UPDATE customers SET
          first_name = ?,
          last_name = ?,
          tel_no = ?,
          email = ?,
          user_name = ?,
          user_password = ?,
          user_salt = ?,
          street = ?,
          city = ?,
          postal_code = ?,
          country = ?,
          same_billing_delivery_address = ?
          WHERE customer_id = ?;
        UPDATE delivery_address SET
          street_delivery = ?,
          city_delivery = ?,
          postal_code_delivery = ?,
          country_delivery = ?
          WHERE delivery_address_id = ?;
        `;
      sqlValues = [
        encrypt(req.body.first_name),
          encrypt(req.body.last_name),
            encrypt(req.body.tel_no),
        encrypt(req.body.email),
        encrypt(req.body.user_name),
        hashedPassword,
        salt,
        encrypt(req.body.street),
        encrypt(req.body.city),
        encrypt(req.body.postal_code),
        encrypt(req.body.country),
        0,
        req.user.customer_id,
        encrypt(req.body.street_delivery),
        encrypt(req.body.city_delivery),
        encrypt(req.body.postal_code_delivery),
        encrypt(req.body.country_delivery),
        delivery_address_id,
      ];
    }

    db.query(sql, sqlValues, (error) => {
      if (error) {
        res.status(500).send("An error occurred while executing the query.");
        res.redirect("/register");
      } else {
        res.render("login");
      }
    });
  } catch (error) {
    res.status(500).send("An error occurred.");
    res.redirect("/register");
  }
};

module.exports = {
  retrieve,
  update,
};