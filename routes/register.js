const bcrypt = require("bcrypt");
const db = require("../db.js");
const {encrypt, decrypt} = require("./crypto");


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
        encrypt(req.body.street_delivery),
        encrypt(req.body.city_delivery),
        encrypt(req.body.postal_code_delivery),
        encrypt(req.body.country_delivery),
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

module.exports = register;
