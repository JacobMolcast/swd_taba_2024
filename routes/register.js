const bcrypt = require("bcrypt");
const db = require("../db.js");

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
        req.body.street_delivery,
        req.body.city_delivery,
        req.body.postal_code_delivery,
        req.body.country_delivery,
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

module.exports = register;
