const bcrypt = require("bcrypt");
const db = require("../db.js");
const {encrypt} = require("./crypto");
const xss = require('xss');


register = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    let sql;
    let sqlValues;
    if (req.body.same_billing_delivery_address === "on") {
      sql = `
        INSERT INTO customers(
          first_name,
          last_name,
          tel_no,
          email,
          user_name,
          user_password,
          user_salt,
          street,
          city,
          postal_code,
          country,
          same_billing_delivery_address)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
      sqlValues = [
        encrypt(xss(req.body.first_name)),
        encrypt(xss(req.body.last_name)),
        encrypt(xss(req.body.tel_no)),
        encrypt(xss(req.body.email)),
        encrypt(xss(req.body.user_name)),
        hashedPassword,
        salt,
        encrypt(xss(req.body.street)),
        encrypt(xss(req.body.city)),
        encrypt(xss(req.body.postal_code)),
        encrypt(xss(req.body.country)),
        1,
      ];
    } else {
      sql = `
        INSERT INTO customers(
          first_name,
          last_name,
          tel_no,
          email,
          user_name,
          user_password,
          user_salt,
          street,
          city,
          postal_code,
          country,
          same_billing_delivery_address)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
          INSERT INTO delivery_address(
            street_delivery,
            city_delivery,
            postal_code_delivery,
            country_delivery)
            VALUES (?, ?, ?, ?);
        `;
      sqlValues = [
        encrypt(xss(req.body.first_name)),
        encrypt(xss(req.body.last_name)),
        encrypt(xss(req.body.tel_no)),
        encrypt(xss(req.body.email)),
        encrypt(xss(req.body.user_name)),
        hashedPassword,
        salt,
        encrypt(xss(req.body.street)),
        encrypt(xss(req.body.city)),
        encrypt(xss(req.body.postal_code)),
        encrypt(xss(req.body.country)),
        0,
        encrypt(xss(req.body.street_delivery)),
        encrypt(xss(req.body.city_delivery)),
        encrypt(xss(req.body.postal_code_delivery)),
        encrypt(xss(req.body.country_delivery)),
      ];
    }

    db.query(sql, sqlValues, (error) => {
      if (error) {
        res.redirect("/register");
      } else {
        res.render("login");
      }
    });
  } catch (error) {
    res.redirect("/register");
  }
};

module.exports = register;
