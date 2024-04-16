const db = require("../db.js");
const bcrypt = require("bcrypt");

let delivery_address_id = 0;

const retrieve = (req, res) => {
  db.query(
    `SELECT * FROM customers LEFT JOIN delivery_address USING (delivery_address_id) WHERE customer_id = ?`,
    [req.user.customer_id],
    (error, results) => {
      if (error) {
        //console.error(error);
        res.redirect("/dashboard");
      } else {
        //console.log(results[0]);
        if (results[0] && results[0].same_billing_delivery_address === 0) {
          delivery_address_id = results[0].delivery_address_id;
          res.render("edit-profile", {
            first_name: results[0].first_name,
            last_name: results[0].last_name,
            tel_no: results[0].tel_no,
            email: results[0].email,
            user_name: results[0].user_name,
            // password: results[0].user_password,
            // confirm_password: results[0].user_password,
            street: results[0].street,
            city: results[0].city,
            postal_code: results[0].postal_code,
            country: results[0].country,
            street_delivery: results[0].street_delivery,
            city_delivery: results[0].city_delivery,
            postal_code_delivery: results[0].postal_code_delivery,
            country_delivery: results[0].country_delivery,
          });
        } else if (results[0] && results[0].same_billing_delivery_address === 1) {
          res.render("edit-profile", {
            first_name: results[0].first_name,
            last_name: results[0].last_name,
            tel_no: results[0].tel_no,
            email: results[0].email,
            user_name: results[0].user_name,
            // password: results[0].user_password,
            // confirm_password: results[0].user_password,
            street: results[0].street,
            city: results[0].city,
            postal_code: results[0].postal_code,
            country: results[0].country,
            street_delivery: results[0].street,
            city_delivery: results[0].city,
            postal_code_delivery: results[0].postal_code,
            country_delivery: results[0].country_delivery,
          });
        } else {
          // Handle the case where no customer was found
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
        req.body.first_name,
        req.body.last_name,
        req.body.tel_no,
        req.body.email,
        req.body.user_name,
        hashedPassword,
        salt,
        req.body.street,
        req.body.city,
        req.body.postal_code,
        req.body.country,
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
        req.body.first_name,
        req.body.last_name,
        req.body.tel_no,
        req.body.email,
        req.body.user_name,
        hashedPassword,
        salt,
        req.body.street,
        req.body.city,
        req.body.postal_code,
        req.body.country,
        0,
        req.user.customer_id,
        req.body.street_delivery,
        req.body.city_delivery,
        req.body.postal_code_delivery,
        req.body.country_delivery,
        delivery_address_id,
      ];
    }

    db.query(sql, sqlValues, (error) => {
      if (error) {
        console.log(error); // don't show this in production
        res.status(500).send("An error occurred while executing the query."); // change it for servererror.ejs?
        res.redirect("/register");
      } else {
        res.render("login");
      }
    });
  } catch (error) {
    console.log(error); // don't show this in production
    res.status(500).send("An error occurred."); // change it for servererror.ejs?
    res.redirect("/register");
  }
};

module.exports = {
  retrieve,
  update,
};