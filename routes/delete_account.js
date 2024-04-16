const db = require("../db.js");

let delivery_address_id = 0;

const delete_account = (req, res) => {
  db.query(
    `DELETE FROM customers WHERE customer_id = ?`,
    [req.user.customer_id],
    (error) => {
        if (error) {
          console.error(error);
          res.redirect("/");
        }
    }
  );
};

module.exports = delete_account;
