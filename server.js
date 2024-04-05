const dotenv = require("dotenv");
const express = require("express");
const db = require("./db.js");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("express-flash");
const session = require("express-session");

dotenv.config();

const app = express();

const authenticateUser = async (userName, password, done) => {
  return db.query(
    `SELECT customer_id, first_name, user_password FROM customers WHERE user_name = ? OR email = ? LIMIT 1`,
    [userName, userName],
    function (error, results) {
      if (error) {
        return done(error);
      } else if (results.length === 0) {
        return done(null, false, {
          message: "No user or email with those credentials",
        });
      } else {
        try {
          bcrypt
            .compare(password, results[0].user_password)
            .then((match) => {
              if (match) {
                return done(null, results[0]);
              } else {
                return done(null, false, { message: "Password incorrect" });
              }
            })
            .catch((e) => {
              return done(e);
            });
        } catch (e) {
          return done(e);
        }
      }
    },
  );
};

passport.use(
  new LocalStrategy({ usernameField: "user_name" }, authenticateUser),
);
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
// app.use(bodyParser.json());

app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/register", checkNotAuthenticated, function (req, res) {
  res.render("register");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
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
          street,
          city,
          postal_code,
          country)
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
});

app.get("/login", checkNotAuthenticated, function (req, res) {
  res.render("login");
});

// app.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/dashboard",
//     failureRedirect: "/login",
//     failureFlash: true,
//   })
// );

app.post("/login", checkNotAuthenticated, (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

app.post("/logout", (req, res) => {
  req.session.destroy(function (err) {
    res.redirect("/login");
  });
});

app.get("/forgot-password", checkNotAuthenticated, function (req, res) {
  res.render("forgot-password");
});

app.get("/dashboard", authenticationMiddleware(), function (req, res) {
  res.render("dashboard", { name: req.user.first_name });
});

function authenticationMiddleware() {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  };
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
}

app.listen(3000, () => console.log("Server is running on port 3000"));
