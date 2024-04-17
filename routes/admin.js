const db = require("../db.js");

const retrieve_all = (req, res) => {
  if (req.user && req.user.customer_id === 1) {
    db.query(
      `SELECT * FROM customers LEFT JOIN delivery_address USING (delivery_address_id)`,
      (error, results) => {
        if (error) {
          res.redirect("/dashboard");
        } else {
          res.render("admin", {
            all: results
          });
        }
      },
    );
  } else {
    res.redirect("/dashboard");
  }
};

module.exports = retrieve_all;
