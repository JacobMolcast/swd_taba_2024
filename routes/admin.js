const db = require("../db.js");
const { decrypt } = require("./crypto");
const xss = require('xss');

const retrieve_all = (req, res) => {
  if (req.user && req.user.admin_role === 1) {
    db.query(
      `SELECT * FROM customers LEFT JOIN delivery_address USING (delivery_address_id)`,
      (error, results) => {
        if (error) {
          res.redirect("/dashboard");
        } else {
          res.render("admin", {
            all: results.map((result) => {
              const user_data = [
                "first_name",
                "last_name",
                "email",
                "user_name",
                "tel_no",
                "street",
                "city",
                "postal_code",
                "country",
              ];
              return user_data.reduce((decryptedResult, column) => {
                decryptedResult[column] = xss(decrypt(result[column]));
                return decryptedResult;
              }, {});
            }),
          });
        }
      },
    );
  } else {
    res.redirect("/dashboard");
  }
};

module.exports = retrieve_all;
