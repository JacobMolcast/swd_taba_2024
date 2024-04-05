const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
  connectionLimit: 10,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  multipleStatements: true,
});

connection.connect((err, connection) => {
  if (err) throw err;
});

module.exports = connection;
